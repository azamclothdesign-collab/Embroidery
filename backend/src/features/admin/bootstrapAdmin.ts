import { config } from "../../platform/config.ts";
import { hashPassword } from "../../platform/crypto.ts";
import { pool } from "../../platform/db.ts";
import { audit } from "./audit.ts";

/**
 * Creates the first admin from ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD, but only
 * when the admin table is empty. That account must change its password on
 * first login. Once any admin exists, these env values are ignored.
 */
export async function bootstrapAdmin(): Promise<void> {
  const existing = await pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM admin_users`);
  if (existing.rows[0]?.count !== "0") return;

  const email = config.ADMIN_EMAIL.trim().toLowerCase();
  const password = config.ADMIN_INITIAL_PASSWORD;
  if (email.length === 0 || password.length === 0) {
    console.warn(
      JSON.stringify({
        level: "warn",
        msg: "No admin exists. Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in .env and restart to create one.",
      }),
    );
    return;
  }
  if (password.length < 10) {
    throw new Error("ADMIN_INITIAL_PASSWORD must be at least 10 characters");
  }

  const result = await pool.query<{ id: string }>(
    `INSERT INTO admin_users (email, password_hash, must_change_password)
     VALUES ($1, $2, TRUE) ON CONFLICT DO NOTHING RETURNING id`,
    [email, await hashPassword(password)],
  );
  const id = result.rows[0]?.id;
  if (id !== undefined) {
    await audit(id, "admin.bootstrapped", { email });
    console.log(JSON.stringify({ level: "info", msg: "First admin created; password change required on first login", email }));
  }
}
