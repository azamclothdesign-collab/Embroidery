import { randomToken, sha256Hex } from "../../platform/crypto.ts";
import { pool, type Queryable } from "../../platform/db.ts";
import { notFound } from "../../platform/errors.ts";
import type { MethodCode } from "../payments/methodSpecs.ts";

export type OrderStatus = "pending_payment" | "awaiting_verification" | "paid" | "failed" | "cancelled" | "refunded";

export type OrderLine = {
  id: string;
  productSlug: string;
  name: { en: string; ur: string };
  image: string | null;
  priceMinor: number;
  packagePath: string;
  packageName: string;
  downloadCount: number;
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  paymentMethod: MethodCode;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  locale: "en" | "ur";
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  couponCode: string | null;
  providerReference: string | null;
  providerTxnId: string | null;
  clientIp: string;
  paidAt: string | null;
  createdAt: string;
  lines: OrderLine[];
};

type OrderRow = {
  id: string;
  number: string;
  status: OrderStatus;
  payment_method: MethodCode;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  locale: "en" | "ur";
  subtotal_minor: number;
  discount_minor: number;
  total_minor: number;
  coupon_code: string | null;
  provider_reference: string | null;
  provider_txn_id: string | null;
  client_ip: string;
  paid_at: Date | null;
  created_at: Date;
};

type LineRow = {
  id: string;
  order_id: string;
  product_slug: string;
  name_en: string;
  name_ur: string;
  image: string | null;
  price_minor: number;
  package_path: string;
  package_name: string;
  download_count: number;
};

function toLine(row: LineRow): OrderLine {
  return {
    id: row.id,
    productSlug: row.product_slug,
    name: { en: row.name_en, ur: row.name_ur },
    image: row.image,
    priceMinor: row.price_minor,
    packagePath: row.package_path,
    packageName: row.package_name,
    downloadCount: row.download_count,
  };
}

function toOrder(row: OrderRow, lines: LineRow[]): Order {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    paymentMethod: row.payment_method,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    locale: row.locale,
    subtotalMinor: row.subtotal_minor,
    discountMinor: row.discount_minor,
    totalMinor: row.total_minor,
    couponCode: row.coupon_code,
    providerReference: row.provider_reference,
    providerTxnId: row.provider_txn_id,
    clientIp: row.client_ip,
    paidAt: row.paid_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    lines: lines.filter((line) => line.order_id === row.id).map(toLine),
  };
}

async function hydrate(rows: OrderRow[], db: Queryable): Promise<Order[]> {
  if (rows.length === 0) return [];
  const lines = await db.query<LineRow>(
    `SELECT * FROM order_lines WHERE order_id = ANY($1::uuid[]) ORDER BY name_en`,
    [rows.map((row) => row.id)],
  );
  return rows.map((row) => toOrder(row, lines.rows));
}

export async function findOrder(by: { number: string } | { id: string }, db: Queryable = pool): Promise<Order> {
  const [column, value] = "number" in by ? ["number", by.number] : ["id", by.id];
  const result = await db.query<OrderRow>(`SELECT * FROM orders WHERE ${column} = $1`, [value]);
  const [order] = await hydrate(result.rows, db);
  if (order === undefined) throw notFound("Order");
  return order;
}

export async function findOrderForUpdate(id: string, db: Queryable): Promise<Order> {
  const result = await db.query<OrderRow>(`SELECT * FROM orders WHERE id = $1 FOR UPDATE`, [id]);
  const [order] = await hydrate(result.rows, db);
  if (order === undefined) throw notFound("Order");
  return order;
}

/** Issues a new customer access token (stored hashed). */
export async function issueAccessToken(orderId: string, days: number, db: Queryable = pool): Promise<string> {
  const token = randomToken();
  await db.query(
    `INSERT INTO order_access_tokens (token_hash, order_id, expires_at) VALUES ($1, $2, NOW() + make_interval(days => $3))`,
    [sha256Hex(token), orderId, days],
  );
  return token;
}

export async function orderIdForToken(number: string, token: string): Promise<string | null> {
  if (token.length < 20 || token.length > 200) return null;
  const result = await pool.query<{ id: string }>(
    `SELECT o.id FROM order_access_tokens t JOIN orders o ON o.id = t.order_id
     WHERE t.token_hash = $1 AND o.number = $2 AND t.expires_at > NOW()`,
    [sha256Hex(token), number],
  );
  return result.rows[0]?.id ?? null;
}

export type OrderListFilter = { status?: OrderStatus; method?: MethodCode; q?: string; page: number; limit: number };

export async function listOrders(filter: OrderListFilter): Promise<{ items: Order[]; total: number; pages: number }> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filter.status !== undefined) {
    params.push(filter.status);
    where.push(`status = $${params.length}`);
  }
  if (filter.method !== undefined) {
    params.push(filter.method);
    where.push(`payment_method = $${params.length}`);
  }
  if (filter.q !== undefined && filter.q.length > 0) {
    params.push(`%${filter.q.replaceAll(/[%_\\]/g, "")}%`);
    const n = params.length;
    where.push(`(number ILIKE $${n} OR customer_email ILIKE $${n} OR customer_name ILIKE $${n} OR customer_phone ILIKE $${n})`);
  }
  params.push(filter.limit, (filter.page - 1) * filter.limit);
  const result = await pool.query<OrderRow & { total_count: string }>(
    `SELECT *, COUNT(*) OVER() AS total_count FROM orders ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY created_at DESC, id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  const total = Number(result.rows[0]?.total_count ?? 0);
  return { items: await hydrate(result.rows, pool), total, pages: Math.max(1, Math.ceil(total / filter.limit)) };
}

export async function recordPaymentEvent(
  input: { orderId: string | null; provider: string; kind: string; eventKey: string | null; verified: boolean; payload: unknown },
  db: Queryable = pool,
): Promise<boolean> {
  const result = await db.query(
    `INSERT INTO payment_events (order_id, provider, kind, event_key, verified, payload)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb) ON CONFLICT DO NOTHING`,
    [input.orderId, input.provider, input.kind, input.eventKey, input.verified, JSON.stringify(input.payload ?? {})],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function listPaymentEvents(orderId: string) {
  const result = await pool.query<{ provider: string; kind: string; verified: boolean; payload: unknown; created_at: Date }>(
    `SELECT provider, kind, verified, payload, created_at FROM payment_events WHERE order_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [orderId],
  );
  return result.rows.map((row) => ({ ...row, created_at: row.created_at.toISOString() }));
}
