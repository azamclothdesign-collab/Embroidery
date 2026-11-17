import { z } from "zod";

const secret = (min: number) => z.string().min(min);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  HOST: z.string().default("127.0.0.1"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().startsWith("postgres"),
  DB_POOL_MAX: z.coerce.number().int().min(2).max(50).default(10),
  SITE_URL: z.url().transform((value) => value.replace(/\/+$/, "")),
  INTERNAL_API_KEY: secret(32),
  SETTINGS_ENCRYPTION_KEY: z
    .string()
    .refine((value) => Buffer.from(value, "base64").length === 32, {
      message: "must be 32 bytes encoded as base64 (openssl rand -base64 32)",
    }),
  DOWNLOAD_SIGNING_KEY: secret(32),
  STORAGE_DIR: z.string().min(1),
  MAX_ZIP_MB: z.coerce.number().int().min(1).max(2048).default(200),
  ADMIN_EMAIL: z.string().default(""),
  ADMIN_INITIAL_PASSWORD: z.string().default(""),
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default(""),
});

export type AppConfig = z.infer<typeof envSchema>;

function loadConfig(): AppConfig {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  if (parsed.data.NODE_ENV === "production" && !parsed.data.SITE_URL.startsWith("https://")) {
    throw new Error("SITE_URL must use https:// in production");
  }

  return parsed.data;
}

export const config = loadConfig();
export const isProduction = config.NODE_ENV === "production";
