import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  HMAC_SIGNING_SECRET: z.string().min(32),
  ALLOWED_ORIGINS: z.string().min(1),
  RATE_LIMIT_CAPACITY: z.coerce.number().positive().default(120),
  RATE_LIMIT_REFILL_PER_SECOND: z.coerce.number().positive().default(2),
  UPLOAD_DIR: z.string().trim().min(1).optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  HMAC_SIGNING_SECRET: process.env.HMAC_SIGNING_SECRET,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  RATE_LIMIT_CAPACITY: process.env.RATE_LIMIT_CAPACITY,
  RATE_LIMIT_REFILL_PER_SECOND: process.env.RATE_LIMIT_REFILL_PER_SECOND,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
});

export function readAllowedOrigins(): readonly string[] {
  return env.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
