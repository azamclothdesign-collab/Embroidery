import pg from "pg";
import { config } from "./config.ts";

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: config.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 5_000,
  idle_in_transaction_session_timeout: 10_000,
  application_name: "embroidery-api",
});

pool.on("error", (error) => {
  console.error(JSON.stringify({ level: "error", msg: "pg pool error", error: error.message }));
});

export type Queryable = Pick<pg.PoolClient, "query">;

/**
 * Runs `work` inside one transaction on one connection.
 * Rolls back on any error and always releases the client.
 */
export async function withTransaction<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let broken = false;

  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      broken = true;
    }
    throw error;
  } finally {
    client.release(broken);
  }
}

export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  if (typeof error !== "object" || error === null) return false;
  const pgError = error as { code?: string; constraint?: string };
  if (pgError.code !== "23505") return false;
  return constraint === undefined || pgError.constraint === constraint;
}

export function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23503";
}
