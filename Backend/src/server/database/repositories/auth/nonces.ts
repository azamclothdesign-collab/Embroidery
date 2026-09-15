import { pool } from "../../pool.js";

export async function storeNonce(nonce: string, expiresAt: Date): Promise<void> {
  await pool.query(
    `INSERT INTO auth_nonces (nonce, expires_at) VALUES ($1, $2)`,
    [nonce, expiresAt.toISOString()],
  );
}

export async function nonceExists(nonce: string): Promise<boolean> {
  const result = await pool.query<{ nonce: string }>(
    `SELECT nonce FROM auth_nonces WHERE nonce = $1 LIMIT 1`,
    [nonce],
  );

  return result.rowCount !== null && result.rowCount > 0;
}

export async function pruneExpiredNonces(now: Date): Promise<void> {
  await pool.query(`DELETE FROM auth_nonces WHERE expires_at <= $1`, [
    now.toISOString(),
  ]);
}
