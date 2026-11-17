import { pool } from "./db.ts";
import { AppError } from "./errors.ts";

export type RatePolicy = {
  /** Bucket size (max burst). */
  capacity: number;
  /** Tokens added per second. */
  refillPerSecond: number;
};

export const policies = {
  read: { capacity: 30, refillPerSecond: 1 },
  mutation: { capacity: 10, refillPerSecond: 0.5 },
  checkout: { capacity: 5, refillPerSecond: 0.1 },
  login: { capacity: 5, refillPerSecond: 1 / 60 },
  passwordReset: { capacity: 3, refillPerSecond: 1 / 300 },
  contact: { capacity: 5, refillPerSecond: 1 / 120 },
  lookup: { capacity: 5, refillPerSecond: 1 / 60 },
  upload: { capacity: 30, refillPerSecond: 0.5 },
} satisfies Record<string, RatePolicy>;

/**
 * Atomic token bucket in PostgreSQL (one statement, shared by every instance).
 * Throws 429 with Retry-After when empty; fails closed if the DB is down.
 */
export async function consume(key: string, policy: RatePolicy): Promise<void> {
  const result = await pool.query<{ tokens: number }>(
    `INSERT INTO rate_limits AS r (key, tokens, updated_at)
     VALUES ($1, $2 - 1, NOW())
     ON CONFLICT (key) DO UPDATE SET
       tokens = LEAST($2, r.tokens + EXTRACT(EPOCH FROM (NOW() - r.updated_at)) * $3) - 1,
       updated_at = NOW()
     RETURNING tokens`,
    [key.slice(0, 200), policy.capacity, policy.refillPerSecond],
  );

  const tokens = result.rows[0]?.tokens ?? -1;
  if (tokens >= 0) return;

  // Undo the overdraw so the bucket never goes far below zero.
  await pool.query(`UPDATE rate_limits SET tokens = GREATEST(tokens, -1) + 1 WHERE key = $1`, [key.slice(0, 200)]);
  const retryAfterSeconds = Math.max(1, Math.ceil(1 / policy.refillPerSecond));
  throw new AppError(429, "rate_limited", "Too many requests. Please wait and try again.", { retryAfterSeconds });
}
