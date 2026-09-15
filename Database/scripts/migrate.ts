import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import pg from "pg";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsRoot = path.join(scriptDir, "..", "migrations");
const backendEnvPath = path.join(scriptDir, "..", "..", "Backend", ".env");

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }

  const contents = readFileSync(filePath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");

    if (separator <= 0) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(backendEnvPath);

function isUndefinedTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42P01"
  );
}

async function listMigrationFiles(): Promise<string[]> {
  const entries = await readdir(migrationsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function isMigrationApplied(
  client: pg.PoolClient,
  filename: string,
): Promise<boolean> {
  try {
    const applied = await client.query<{ filename: string }>(
      `SELECT filename FROM schema_migrations WHERE filename = $1 LIMIT 1`,
      [filename],
    );

    return applied.rowCount !== null && applied.rowCount > 0;
  } catch (error) {
    if (isUndefinedTableError(error)) {
      return false;
    }

    throw error;
  }
}

async function run(): Promise<void> {
  const databaseUrl =
    process.env.DATABASE_MIGRATION_URL?.trim() ||
    process.env.DATABASE_URL?.trim();

  if (databaseUrl === undefined || databaseUrl === "") {
    throw new Error("DATABASE_URL or DATABASE_MIGRATION_URL is required");
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    const files = await listMigrationFiles();

    for (const filename of files) {
      if (await isMigrationApplied(client, filename)) {
        continue;
      }

      const sqlPath = path.join(migrationsRoot, filename);
      const sql = await readFile(sqlPath, "utf8");

      await client.query("BEGIN");
      await client.query(sql);

      if (filename !== "0001_schema_migrations.sql") {
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)`,
          [filename],
        );
      } else {
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)
           ON CONFLICT (filename) DO NOTHING`,
          [filename],
        );
      }

      await client.query("COMMIT");
      process.stdout.write(`Applied ${filename}\n`);
    }
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Migration failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
