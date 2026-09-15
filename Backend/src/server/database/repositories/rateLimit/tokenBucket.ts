import { pool } from "../../pool.js";
import { env } from "../../../../schemas/envSchema.js";

type BucketRow = {
  tokens: string;
  capacity: string;
  refill_rate_per_second: string;
  last_refill_at: Date;
};

export type RateLimitResult =
  | { allowed: true; retryAfterSeconds?: never }
  | { allowed: false; retryAfterSeconds: number };

export async function consumeRateLimitToken(
  bucketKey: string,
): Promise<RateLimitResult> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const now = new Date();
    const selected = await client.query<BucketRow>(
      `SELECT tokens, capacity, refill_rate_per_second, last_refill_at
       FROM rate_limit_buckets
       WHERE bucket_key = $1
       FOR UPDATE`,
      [bucketKey],
    );

    const capacity = env.RATE_LIMIT_CAPACITY;
    const refillRate = env.RATE_LIMIT_REFILL_PER_SECOND;

    if (selected.rowCount === 0) {
      await client.query(
        `INSERT INTO rate_limit_buckets (
           bucket_key,
           tokens,
           capacity,
           refill_rate_per_second,
           last_refill_at,
           updated_at
         ) VALUES ($1, $2, $3, $4, $5, $5)`,
        [bucketKey, capacity - 1, capacity, refillRate, now.toISOString()],
      );
      await client.query("COMMIT");
      return { allowed: true };
    }

    const row = selected.rows[0];

    if (row === undefined) {
      await client.query("ROLLBACK");
      return { allowed: false, retryAfterSeconds: 1 };
    }

    const elapsedSeconds =
      (now.getTime() - new Date(row.last_refill_at).getTime()) / 1000;
    const refilledTokens = Math.min(
      Number(row.capacity),
      Number(row.tokens) + elapsedSeconds * Number(row.refill_rate_per_second),
    );

    if (refilledTokens < 1) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((1 - refilledTokens) / Number(row.refill_rate_per_second)),
      );
      await client.query("ROLLBACK");
      return { allowed: false, retryAfterSeconds };
    }

    await client.query(
      `UPDATE rate_limit_buckets
       SET tokens = $2,
           last_refill_at = $3,
           updated_at = $3
       WHERE bucket_key = $1`,
      [bucketKey, refilledTokens - 1, now.toISOString()],
    );

    await client.query("COMMIT");
    return { allowed: true };
  } catch {
    await client.query("ROLLBACK");
    throw new Error("rate_limit_failed");
  } finally {
    client.release();
  }
}
