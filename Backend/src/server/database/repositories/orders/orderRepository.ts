import { pool } from "../../pool.js";

import {
  type OrderLine,
  type OrderPaymentStatus,
  type OrderRecord,
} from "../../../../types/order.js";

type OrderRow = {
  id: string;
  email: string;
  contact_name: string | null;
  phone: string | null;
  total_cents: number;
  discount_cents: number;
  payment_status: string;
  payment_provider: string | null;
  payment_reference: string | null;
  paid_at: Date | null;
  created_at: Date;
};

type OrderLineRow = {
  slug: string;
  pdp_slug: string;
  name: string;
  display_name: string;
  price_cents: number;
  image_src: string;
  image_alt: string;
  formats: string[];
  formats_label: string;
  size_label: string;
  stitch_label: string;
  package_path: string | null;
  package_file_name: string | null;
};

const orderSelect = `id, email, contact_name, phone, total_cents, discount_cents,
  payment_status, payment_provider, payment_reference, paid_at, created_at`;

function mapPaymentStatus(value: string): OrderPaymentStatus {
  if (value === "paid" || value === "failed") {
    return value;
  }

  return "pending";
}

function mapOrderLine(row: OrderLineRow): OrderLine {
  const line: OrderLine = {
    slug: row.slug,
    pdpSlug: row.pdp_slug,
    name: row.name,
    displayName: row.display_name,
    priceCents: row.price_cents,
    imageSrc: row.image_src,
    imageAlt: row.image_alt,
    formats: row.formats,
    formatsLabel: row.formats_label,
    sizeLabel: row.size_label,
    stitchLabel: row.stitch_label,
  };

  if (row.package_path !== null) {
    line.packagePath = row.package_path;
  }

  if (row.package_file_name !== null) {
    line.packageFileName = row.package_file_name;
  }

  return line;
}

async function loadOrderLines(orderId: string): Promise<OrderLine[]> {
  const result = await pool.query<OrderLineRow>(
    `SELECT product_slug AS slug, pdp_slug, name, display_name, price_cents,
            image_src, image_alt, formats, formats_label, size_label, stitch_label,
            package_path, package_file_name
     FROM order_lines
     WHERE order_id = $1
     ORDER BY display_name ASC`,
    [orderId],
  );

  return result.rows.map(mapOrderLine);
}

function mapOrderRow(row: OrderRow, lines: OrderLine[]): OrderRecord {
  const order: OrderRecord = {
    id: row.id,
    email: row.email,
    createdAt: row.created_at.toISOString(),
    totalCents: row.total_cents,
    discountCents: row.discount_cents,
    paymentStatus: mapPaymentStatus(row.payment_status),
    lines,
  };

  if (row.contact_name !== null && row.contact_name.trim().length > 0) {
    order.contactName = row.contact_name;
  }

  if (row.phone !== null && row.phone.trim().length > 0) {
    order.phone = row.phone;
  }

  if (row.payment_provider !== null && row.payment_provider.trim().length > 0) {
    order.paymentProvider = row.payment_provider;
  }

  if (
    row.payment_reference !== null &&
    row.payment_reference.trim().length > 0
  ) {
    order.paymentReference = row.payment_reference;
  }

  if (row.paid_at !== null) {
    order.paidAt = row.paid_at.toISOString();
  }

  return order;
}

export async function listOrdersForCustomer(
  customerId: string,
): Promise<OrderRecord[]> {
  const result = await pool.query<OrderRow>(
    `SELECT ${orderSelect}
     FROM orders
     WHERE customer_id = $1
     ORDER BY created_at DESC`,
    [customerId],
  );

  const orders: OrderRecord[] = [];

  for (const row of result.rows) {
    const lines = await loadOrderLines(row.id);
    orders.push(mapOrderRow(row, lines));
  }

  return orders;
}

export async function listAllOrders(): Promise<OrderRecord[]> {
  const result = await pool.query<OrderRow>(
    `SELECT ${orderSelect}
     FROM orders
     ORDER BY created_at DESC`,
  );

  const orders: OrderRecord[] = [];

  for (const row of result.rows) {
    const lines = await loadOrderLines(row.id);
    orders.push(mapOrderRow(row, lines));
  }

  return orders;
}

export async function findOrderById(orderId: string): Promise<OrderRecord | null> {
  const result = await pool.query<OrderRow>(
    `SELECT ${orderSelect}
     FROM orders
     WHERE id = $1`,
    [orderId],
  );

  const row = result.rows[0];

  if (row === undefined) {
    return null;
  }

  const lines = await loadOrderLines(row.id);
  return mapOrderRow(row, lines);
}

export async function findOrderForCustomer(input: {
  customerId: string;
  orderId: string;
}): Promise<OrderRecord | null> {
  const result = await pool.query<OrderRow>(
    `SELECT ${orderSelect}
     FROM orders
     WHERE id = $1 AND customer_id = $2`,
    [input.orderId, input.customerId],
  );

  const row = result.rows[0];

  if (row === undefined) {
    return null;
  }

  const lines = await loadOrderLines(row.id);
  return mapOrderRow(row, lines);
}

export async function insertOrder(input: {
  id: string;
  customerId?: string;
  email: string;
  contactName: string;
  phone: string;
  totalCents: number;
  discountCents: number;
  lines: OrderLine[];
  paymentStatus?: OrderPaymentStatus;
  paymentProvider?: string;
}): Promise<OrderRecord> {
  const client = await pool.connect();
  const paymentStatus = input.paymentStatus ?? "pending";

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO orders (
         id, customer_id, email, contact_name, phone, total_cents, discount_cents,
         payment_status, payment_provider
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        input.id,
        input.customerId ?? null,
        input.email,
        input.contactName,
        input.phone,
        input.totalCents,
        input.discountCents,
        paymentStatus,
        input.paymentProvider ?? null,
      ],
    );

    for (const line of input.lines) {
      await client.query(
        `INSERT INTO order_lines (
           order_id, product_slug, pdp_slug, name, display_name, price_cents,
           image_src, image_alt, formats, formats_label, size_label, stitch_label,
           package_path, package_file_name
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14)`,
        [
          input.id,
          line.slug,
          line.pdpSlug,
          line.name,
          line.displayName,
          line.priceCents,
          line.imageSrc,
          line.imageAlt,
          JSON.stringify(line.formats),
          line.formatsLabel,
          line.sizeLabel,
          line.stitchLabel,
          line.packagePath ?? null,
          line.packageFileName ?? null,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const order = await findOrderById(input.id);

  if (order === null) {
    throw new Error("order_insert_failed");
  }

  return order;
}

export async function updateOrderPayment(input: {
  orderId: string;
  paymentStatus: OrderPaymentStatus;
  paymentProvider?: string;
  paymentReference?: string;
}): Promise<OrderRecord | null> {
  const paidAt =
    input.paymentStatus === "paid" ? new Date().toISOString() : null;

  await pool.query(
    `UPDATE orders
     SET payment_status = $2,
         payment_provider = COALESCE($3, payment_provider),
         payment_reference = COALESCE($4, payment_reference),
         paid_at = CASE
           WHEN $2 = 'paid' THEN COALESCE(paid_at, $5::timestamptz)
           ELSE paid_at
         END
     WHERE id = $1`,
    [
      input.orderId,
      input.paymentStatus,
      input.paymentProvider ?? null,
      input.paymentReference ?? null,
      paidAt,
    ],
  );

  return findOrderById(input.orderId);
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM orders WHERE id = $1`, [
    orderId,
  ]);

  return (result.rowCount ?? 0) > 0;
}
