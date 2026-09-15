import { pool } from "../../pool.js";

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  role: string;
};

type AdminSessionRow = {
  admin_user_id: string;
};

export async function findAdminByEmail(
  email: string,
): Promise<AdminUserRow | null> {
  const result = await pool.query<AdminUserRow>(
    `SELECT id, email, password_hash, password_salt, role
     FROM admin_users
     WHERE email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function findAdminById(
  adminUserId: string,
): Promise<AdminUserRow | null> {
  const result = await pool.query<AdminUserRow>(
    `SELECT id, email, password_hash, password_salt, role
     FROM admin_users
     WHERE id = $1`,
    [adminUserId],
  );

  return result.rows[0] ?? null;
}

export async function createAdminSession(input: {
  adminUserId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await pool.query(
    `INSERT INTO admin_sessions (admin_user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [input.adminUserId, input.tokenHash, input.expiresAt.toISOString()],
  );
}

export async function deleteAdminSession(tokenHash: string): Promise<void> {
  await pool.query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [
    tokenHash,
  ]);
}

export async function findAdminSession(
  tokenHash: string,
): Promise<AdminSessionRow | null> {
  const result = await pool.query<AdminSessionRow>(
    `SELECT admin_user_id
     FROM admin_sessions
     WHERE token_hash = $1
       AND expires_at > NOW()`,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

export type { AdminUserRow };
