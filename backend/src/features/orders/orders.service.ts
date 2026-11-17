import { sha256Hex } from "../../platform/crypto.ts";
import { isUniqueViolation, pool, withTransaction } from "../../platform/db.ts";
import { AppError, badRequest, conflict } from "../../platform/errors.ts";
import { getSetting } from "../../platform/settingsStore.ts";
import { signedDownloadUrl } from "../downloads/downloads.ts";
import { publicMethods, requireActiveMethod } from "../payments/methods.repo.ts";
import type { MethodCode } from "../payments/methodSpecs.ts";
import { createOrderNumber } from "./orderNumber.ts";
import { sendOrderEmail } from "./orderEmails.ts";
import { findOrder, issueAccessToken, type Order } from "./orders.repo.ts";
import { checkCoupon, computeTotals, unitPrice, type CouponRule } from "./pricing.ts";

export type CreateOrderInput = {
  items: string[];
  name: string;
  email: string;
  phone: string;
  method: MethodCode;
  couponCode: string | null;
  locale: "en" | "ur";
  idempotencyKey: string;
  ip: string;
};

type ProductRow = {
  id: string;
  slug: string;
  name_en: string;
  name_ur: string;
  images: string[];
  price_minor: number;
  sale_price_minor: number | null;
  package_path: string;
  package_name: string;
};

async function loadCoupon(code: string): Promise<CouponRule | null> {
  const result = await pool.query<{
    code: string; kind: "percent" | "fixed"; value: number; min_subtotal_minor: number; max_uses: number | null;
    used_count: number; starts_at: Date | null; ends_at: Date | null; is_active: boolean;
  }>(`SELECT * FROM coupons WHERE code = $1`, [code.toUpperCase()]);
  const row = result.rows[0];
  if (row === undefined) return null;
  return {
    code: row.code, kind: row.kind, value: row.value, minSubtotalMinor: row.min_subtotal_minor, maxUses: row.max_uses,
    usedCount: row.used_count, startsAt: row.starts_at, endsAt: row.ends_at, isActive: row.is_active,
  };
}

async function loadProducts(slugs: string[]): Promise<ProductRow[]> {
  const unique = [...new Set(slugs)];
  const result = await pool.query<ProductRow>(
    `SELECT p.id, p.slug, p.name_en, p.name_ur, p.images, p.price_minor, p.sale_price_minor, p.package_path, p.package_name
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ANY($1::text[]) AND p.status = 'published' AND c.is_visible AND p.package_path IS NOT NULL`,
    [unique],
  );
  if (result.rows.length !== unique.length) {
    const found = new Set(result.rows.map((row) => row.slug));
    throw badRequest("items_unavailable", "Some designs in your cart are no longer available", {
      items: unique.filter((slug) => !found.has(slug)).join(","),
    });
  }
  return result.rows;
}

/** Quote for the cart page: server prices + coupon check, no side effects. */
export async function quote(items: string[], couponCode: string | null) {
  const products = await loadProducts(items);
  const coupon = couponCode === null ? null : await loadCoupon(couponCode);
  const base = computeTotals(products.map((p) => ({ priceMinor: p.price_minor, salePriceMinor: p.sale_price_minor })), null);
  let couponError: string | null = null;
  let applied: CouponRule | null = null;
  if (couponCode !== null) {
    if (coupon === null) couponError = "not_found";
    else {
      const check = checkCoupon(coupon, base.subtotalMinor, new Date());
      if (check.ok) applied = coupon;
      else couponError = check.reason;
    }
  }
  const totals = computeTotals(products.map((p) => ({ priceMinor: p.price_minor, salePriceMinor: p.sale_price_minor })), applied);
  return { ...totals, couponCode: applied?.code ?? null, couponError, methods: await publicMethods() };
}

/**
 * Idempotent: the same key + same cart returns the same order; the same key
 * with a different cart is a 409. Prices always come from the database.
 */
export async function createOrder(input: CreateOrderInput): Promise<{ number: string; accessToken: string }> {
  const requestHash = sha256Hex(
    JSON.stringify([[...new Set(input.items)].sort(), input.name, input.email, input.phone, input.method, input.couponCode, input.locale]),
  );
  const store = await getSetting("store");

  const existing = await pool.query<{ id: string; number: string; request_hash: string }>(
    `SELECT id, number, request_hash FROM orders WHERE idempotency_key = $1`,
    [input.idempotencyKey],
  );
  const prior = existing.rows[0];
  if (prior !== undefined) {
    if (prior.request_hash !== requestHash) throw conflict("idempotency_conflict", "This checkout was already submitted with different details");
    return { number: prior.number, accessToken: await issueAccessToken(prior.id, store.accessDays) };
  }

  await requireActiveMethod(input.method);
  const products = await loadProducts(input.items);
  const priced = products.map((p) => ({ priceMinor: p.price_minor, salePriceMinor: p.sale_price_minor }));

  let coupon: CouponRule | null = null;
  if (input.couponCode !== null) {
    coupon = await loadCoupon(input.couponCode);
    const check = coupon === null ? { ok: false as const } : checkCoupon(coupon, computeTotals(priced, null).subtotalMinor, new Date());
    if (!check.ok) throw badRequest("coupon_invalid", "This coupon code cannot be used", { couponCode: "Invalid or expired" });
  }
  const totals = computeTotals(priced, coupon);
  const manual = input.method === "bank" || input.method === "cod";

  try {
    const created = await withTransaction(async (db) => {
      if (coupon !== null) {
        const used = await db.query(
          `UPDATE coupons SET used_count = used_count + 1 WHERE code = $1 AND (max_uses IS NULL OR used_count < max_uses)`,
          [coupon.code],
        );
        if (used.rowCount === 0) throw badRequest("coupon_invalid", "This coupon has been used up", { couponCode: "Used up" });
      }
      const order = await db.query<{ id: string; number: string }>(
        `INSERT INTO orders (number, status, payment_method, customer_name, customer_email, customer_phone, locale,
           subtotal_minor, discount_minor, total_minor, coupon_code, idempotency_key, request_hash, client_ip)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id, number`,
        [
          createOrderNumber(), manual ? "awaiting_verification" : "pending_payment", input.method, input.name,
          input.email.toLowerCase(), input.phone, input.locale, totals.subtotalMinor, totals.discountMinor,
          totals.totalMinor, coupon?.code ?? null, input.idempotencyKey, requestHash, input.ip,
        ],
      );
      const row = order.rows[0];
      if (row === undefined) throw new Error("Order insert returned no row");
      for (const product of products) {
        await db.query(
          `INSERT INTO order_lines (order_id, product_id, product_slug, name_en, name_ur, image, price_minor, package_path, package_name)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [row.id, product.id, product.slug, product.name_en, product.name_ur, product.images[0] ?? null,
            unitPrice({ priceMinor: product.price_minor, salePriceMinor: product.sale_price_minor }),
            product.package_path, product.package_name],
        );
      }
      return { ...row, token: await issueAccessToken(row.id, store.accessDays, db) };
    });

    const order = await findOrder({ id: created.id });
    await sendOrderEmail("received", order, created.token);
    return { number: created.number, accessToken: created.token };
  } catch (error) {
    if (isUniqueViolation(error, "orders_idempotency_key_key")) return createOrder(input);
    if (isUniqueViolation(error, "orders_number_key")) return createOrder(input);
    throw error;
  }
}

/** What the customer sees on the order page (only after the access token was checked). */
export async function customerView(order: Order) {
  const store = await getSetting("store");
  const methods = await publicMethods();
  const method = methods.find((m) => m.code === order.paymentMethod) ?? null;
  const proof = await pool.query<{ status: string; created_at: Date }>(
    `SELECT status, created_at FROM bank_proofs WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [order.id],
  );
  const paid = order.status === "paid";
  return {
    number: order.number,
    status: order.status,
    paymentMethod: order.paymentMethod,
    method: method === null ? null : { label: method.label, instructions: method.instructions, details: paid ? {} : method.details },
    customer: { name: order.customerName, email: order.customerEmail, phone: order.customerPhone },
    subtotalMinor: order.subtotalMinor,
    discountMinor: order.discountMinor,
    totalMinor: order.totalMinor,
    couponCode: order.couponCode,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    canPay: (order.status === "pending_payment" || order.status === "failed") && method?.kind === "gateway",
    bankProof: proof.rows[0] === undefined ? null : { status: proof.rows[0].status, createdAt: proof.rows[0].created_at.toISOString() },
    downloadLimit: store.downloadLimit,
    lines: order.lines.map((line) => ({
      id: line.id,
      slug: line.productSlug,
      name: line.name,
      image: line.image,
      priceMinor: line.priceMinor,
      downloadsLeft: Math.max(0, store.downloadLimit - line.downloadCount),
      downloadUrl: paid && line.downloadCount < store.downloadLimit ? signedDownloadUrl(line.id) : null,
    })),
  };
}

/** Track order: emails a fresh link if number + email match. Same response either way. */
export async function emailOrderLink(number: string, email: string): Promise<void> {
  let order: Order;
  try {
    order = await findOrder({ number });
  } catch (error) {
    if (error instanceof AppError && error.status === 404) return;
    throw error;
  }
  if (order.customerEmail !== email.toLowerCase()) return;
  const store = await getSetting("store");
  await sendOrderEmail("link", order, await issueAccessToken(order.id, store.accessDays));
}
