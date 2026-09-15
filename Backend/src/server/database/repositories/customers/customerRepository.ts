import { pool } from "../../pool.js";

import { type CustomerListItem } from "../../../../types/account.js";

type CustomerListRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  order_count: number;
  spent_cents: number;
};

function mapCustomerListRow(row: CustomerListRow): CustomerListItem {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    createdAt: row.created_at.toISOString(),
    orderCount: row.order_count,
    spentCents: row.spent_cents,
  };
}

export async function listCustomers(): Promise<CustomerListItem[]> {
  const result = await pool.query<CustomerListRow>(
    `SELECT c.id, c.email, c.first_name, c.last_name, c.created_at,
            COUNT(o.id)::int AS order_count,
            COALESCE(SUM(o.total_cents), 0)::int AS spent_cents
     FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id
     GROUP BY c.id, c.email, c.first_name, c.last_name, c.created_at
     ORDER BY c.created_at DESC`,
  );

  return result.rows.map(mapCustomerListRow);
}

export async function findCustomerById(
  id: string,
): Promise<CustomerListItem | null> {
  const result = await pool.query<CustomerListRow>(
    `SELECT c.id, c.email, c.first_name, c.last_name, c.created_at,
            COUNT(o.id)::int AS order_count,
            COALESCE(SUM(o.total_cents), 0)::int AS spent_cents
     FROM customers c
     LEFT JOIN orders o ON o.customer_id = c.id
     WHERE c.id = $1
     GROUP BY c.id, c.email, c.first_name, c.last_name, c.created_at`,
    [id],
  );

  const row = result.rows[0];

  if (row === undefined) {
    return null;
  }

  return mapCustomerListRow(row);
}
