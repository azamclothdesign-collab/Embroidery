import { pool } from "../../pool.js";

type CustomerRow = {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  first_name: string;
  last_name: string;
  created_at: Date;
};

type CustomerSessionRow = {
  customer_id: string;
};

export async function findCustomerByEmail(
  email: string,
): Promise<CustomerRow | null> {
  const result = await pool.query<CustomerRow>(
    `SELECT id, email, password_hash, password_salt, first_name, last_name, created_at
     FROM customers
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function findCustomerById(
  customerId: string,
): Promise<CustomerRow | null> {
  const result = await pool.query<CustomerRow>(
    `SELECT id, email, password_hash, password_salt, first_name, last_name, created_at
     FROM customers
     WHERE id = $1`,
    [customerId],
  );

  return result.rows[0] ?? null;
}

export async function insertCustomer(input: {
  email: string;
  passwordHash: string;
  passwordSalt: string;
  firstName: string;
  lastName: string;
}): Promise<CustomerRow> {
  const result = await pool.query<CustomerRow>(
    `INSERT INTO customers (
       email,
       password_hash,
       password_salt,
       first_name,
       last_name
     ) VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, password_hash, password_salt, first_name, last_name, created_at`,
    [
      input.email,
      input.passwordHash,
      input.passwordSalt,
      input.firstName,
      input.lastName,
    ],
  );

  const row = result.rows[0];

  if (row === undefined) {
    throw new Error("customer_insert_failed");
  }

  await pool.query(
    `INSERT INTO customer_preferences (customer_id)
     VALUES ($1)
     ON CONFLICT (customer_id) DO NOTHING`,
    [row.id],
  );

  return row;
}

export async function updateCustomerPassword(input: {
  customerId: string;
  passwordHash: string;
  passwordSalt: string;
}): Promise<void> {
  await pool.query(
    `UPDATE customers
     SET password_hash = $2,
         password_salt = $3
     WHERE id = $1`,
    [input.customerId, input.passwordHash, input.passwordSalt],
  );
}

export async function updateCustomerProfile(input: {
  customerId: string;
  firstName: string;
  lastName: string;
}): Promise<void> {
  await pool.query(
    `UPDATE customers
     SET first_name = $2,
         last_name = $3
     WHERE id = $1`,
    [input.customerId, input.firstName, input.lastName],
  );
}

export async function createCustomerSession(input: {
  customerId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await pool.query(
    `INSERT INTO customer_sessions (customer_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [input.customerId, input.tokenHash, input.expiresAt.toISOString()],
  );
}

export async function deleteCustomerSession(tokenHash: string): Promise<void> {
  await pool.query(`DELETE FROM customer_sessions WHERE token_hash = $1`, [
    tokenHash,
  ]);
}

export async function deleteCustomerSessions(customerId: string): Promise<void> {
  await pool.query(`DELETE FROM customer_sessions WHERE customer_id = $1`, [
    customerId,
  ]);
}

export async function findCustomerSession(
  tokenHash: string,
): Promise<CustomerSessionRow | null> {
  const result = await pool.query<CustomerSessionRow>(
    `SELECT customer_id
     FROM customer_sessions
     WHERE token_hash = $1
       AND expires_at > NOW()`,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

export type { CustomerRow };
