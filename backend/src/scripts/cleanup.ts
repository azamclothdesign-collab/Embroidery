import { pool } from "../platform/db.ts";
import { dirs, removeQuietly, resolveInside } from "../platform/storage.ts";

/**
 * Housekeeping. Run hourly from cron:
 *   0 * * * * cd /var/www/embroidery-store/backend && npm run cleanup >> /var/log/embroidery/cleanup.log 2>&1
 */
const statements: Array<[string, string]> = [
  ["expired admin sessions", "DELETE FROM admin_sessions WHERE expires_at < NOW()"],
  ["old password resets", "DELETE FROM admin_password_resets WHERE expires_at < NOW() - INTERVAL '1 day'"],
  ["expired order access tokens", "DELETE FROM order_access_tokens WHERE expires_at < NOW()"],
  ["idle rate-limit buckets", "DELETE FROM rate_limits WHERE updated_at < NOW() - INTERVAL '1 day'"],
  [
    "abandoned gateway orders (cancelled after 7 days unpaid)",
    `UPDATE orders SET status = 'cancelled'
     WHERE status = 'pending_payment' AND payment_method IN ('payfast','jazzcash','easypaisa')
       AND created_at < NOW() - INTERVAL '7 days'`,
  ],
];

async function main(): Promise<void> {
  for (const [label, sql] of statements) {
    const result = await pool.query(sql);
    console.log(`${new Date().toISOString()} ${label}: ${result.rowCount ?? 0}`);
  }

  // ZIPs uploaded in the admin but never attached to a saved design.
  const orphans = await pool.query<{ id: string }>(
    `DELETE FROM package_uploads WHERE created_at < NOW() - INTERVAL '1 day' RETURNING id`,
  );
  for (const row of orphans.rows) {
    await removeQuietly(resolveInside(dirs.packages, `${row.id}.zip`));
  }
  console.log(`${new Date().toISOString()} orphan ZIP uploads: ${orphans.rowCount ?? 0}`);
}

main()
  .catch((error: unknown) => {
    console.error((error as Error).message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
