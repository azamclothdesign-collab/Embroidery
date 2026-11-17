import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

/**
 * Applies migrations/*.sql in name order, each in its own transaction.
 * - pg advisory lock: only one runner at a time
 * - checksum ledger: refuses to run if an applied file was edited
 */
const LOCK_ID = 727_100_001;
const migrationsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../migrations");

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (url === undefined || url.length === 0) throw new Error("DATABASE_URL is not set");

  const client = new pg.Client({ connectionString: url, application_name: "embroidery-migrate" });
  await client.connect();

  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    const applied = new Map(
      (await client.query<{ name: string; checksum: string }>("SELECT name, checksum FROM schema_migrations")).rows.map(
        (row) => [row.name, row.checksum],
      ),
    );
    const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();

    for (const name of files) {
      const sql = await readFile(path.join(migrationsDir, name), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const previous = applied.get(name);

      if (previous !== undefined) {
        if (previous !== checksum) {
          throw new Error(`Migration ${name} was modified after being applied. Add a new migration instead.`);
        }
        continue;
      }

      console.log(`Applying ${name} …`);
      await client.query("BEGIN");
      try {
        await client.query("SET LOCAL lock_timeout = '5s'");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [name, checksum]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${name} failed: ${(error as Error).message}`);
      }
    }
    console.log("Migrations up to date.");
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => undefined);
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
