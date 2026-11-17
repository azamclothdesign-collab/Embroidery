import { pool, type Queryable } from "../../platform/db.ts";

export async function audit(
  adminId: string | null,
  action: string,
  detail: Record<string, unknown> = {},
  ip = "",
  db: Queryable = pool,
): Promise<void> {
  await db.query(`INSERT INTO audit_log (admin_id, action, detail, ip) VALUES ($1, $2, $3::jsonb, $4)`, [
    adminId,
    action,
    JSON.stringify(detail),
    ip,
  ]);
}

export type AuditEntry = {
  id: string;
  action: string;
  detail: Record<string, unknown>;
  ip: string;
  adminEmail: string | null;
  createdAt: string;
};

export async function listAudit(limit: number): Promise<AuditEntry[]> {
  const result = await pool.query<{
    id: string;
    action: string;
    detail: Record<string, unknown>;
    ip: string;
    email: string | null;
    created_at: Date;
  }>(
    `SELECT a.id, a.action, a.detail, a.ip, u.email, a.created_at
     FROM audit_log a LEFT JOIN admin_users u ON u.id = a.admin_id
     ORDER BY a.created_at DESC, a.id DESC LIMIT $1`,
    [limit],
  );
  return result.rows.map((row) => ({
    id: row.id,
    action: row.action,
    detail: row.detail,
    ip: row.ip,
    adminEmail: row.email,
    createdAt: row.created_at.toISOString(),
  }));
}
