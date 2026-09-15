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

type TokenDecision =
  | { allowed: true; nextTokens: number }
  | { allowed: false; retryAfterSeconds: number };

function consumeFromRow(row: BucketRow, now: Date): TokenDecision {
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
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, nextTokens: refilledTokens - 1 };
}

export async function consumeRateLimitToken(
  bucketKey: string,
): Promise<RateLimitResult> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const now = new Date();
    let selected = await client.query<BucketRow>(
      `SELECT tokens, capacity, refill_rate_per_second, last_refill_at
       FROM rate_limit_buckets
       WHERE bucket_key = $1
       FOR UPDATE`,
      [bucketKey],
    );

    const capacity = env.RATE_LIMIT_CAPACITY;
    const refillRate = env.RATE_LIMIT_REFILL_PER_SECOND;

    if (selected.rowCount === 0) {
      const inserted = await client.query<BucketRow>(
        `INSERT INTO rate_limit_buckets (
           bucket_key,
           tokens,
           capacity,
           refill_rate_per_second,
           last_refill_at,
           updated_at
         ) VALUES ($1, $2, $3, $4, $5, $5)
         ON CONFLICT (bucket_key) DO NOTHING
         RETURNING tokens, capacity, refill_rate_per_second, last_refill_at`,
        [bucketKey, capacity - 1, capacity, refillRate, now.toISOString()],
      );

      if ((inserted.rowCount ?? 0) > 0) {
        await client.query("COMMIT");
        return { allowed: true };
      }

      selected = await client.query<BucketRow>(
        `SELECT tokens, capacity, refill_rate_per_second, last_refill_at
         FROM rate_limit_buckets
         WHERE bucket_key = $1
         FOR UPDATE`,
        [bucketKey],
      );
    }

    const row = selected.rows[0];

    if (row === undefined) {
      await client.query("ROLLBACK");
      return { allowed: false, retryAfterSeconds: 1 };
    }

    const decision = consumeFromRow(row, now);

    if (!decision.allowed) {
      await client.query("ROLLBACK");
      return { allowed: false, retryAfterSeconds: decision.retryAfterSeconds };
    }

    await client.query(
      `UPDATE rate_limit_buckets
       SET tokens = $2,
           last_refill_at = $3,
           updated_at = $3
       WHERE bucket_key = $1`,
      [bucketKey, decision.nextTokens, now.toISOString()],
    );

    await client.query("COMMIT");
    return { allowed: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
