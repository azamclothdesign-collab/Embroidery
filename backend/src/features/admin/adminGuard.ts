import type { FastifyRequest } from "fastify";
import { sha256Hex } from "../../platform/crypto.ts";
import { pool } from "../../platform/db.ts";
import { AppError, unauthorized } from "../../platform/errors.ts";
import { requireInternal } from "../../platform/http.ts";

export type AdminIdentity = {
  id: string;
  email: string;
  mustChangePassword: boolean;
  sessionHash: string;
};

const identities = new WeakMap<FastifyRequest, AdminIdentity>();

export async function loadAdminSession(rawToken: string): Promise<AdminIdentity | null> {
  if (rawToken.length < 20 || rawToken.length > 200) return null;
  const sessionHash = sha256Hex(rawToken);
  const result = await pool.query<{ id: string; email: string; must_change_password: boolean }>(
    `SELECT u.id, u.email, u.must_change_password
     FROM admin_sessions s JOIN admin_users u ON u.id = s.admin_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [sessionHash],
  );
  const row = result.rows[0];
  if (row === undefined) return null;
  return { id: row.id, email: row.email, mustChangePassword: row.must_change_password, sessionHash };
}

/** preHandler: internal caller + valid admin session in x-admin-session. */
export async function requireAdmin(request: FastifyRequest): Promise<void> {
  await requireInternal(request);
  const header = request.headers["x-admin-session"];
  if (typeof header !== "string") throw unauthorized();
  const identity = await loadAdminSession(header);
  if (identity === null) throw unauthorized();
  identities.set(request, identity);
}

/**
 * Same as requireAdmin, but also blocks everything except the account
 * screen until the bootstrap password has been changed.
 */
export async function requireReadyAdmin(request: FastifyRequest): Promise<void> {
  await requireAdmin(request);
  if (getAdmin(request).mustChangePassword) {
    throw new AppError(403, "password_change_required", "Change your password first");
  }
}

export function getAdmin(request: FastifyRequest): AdminIdentity {
  const identity = identities.get(request);
  if (identity === undefined) throw unauthorized();
  return identity;
}
