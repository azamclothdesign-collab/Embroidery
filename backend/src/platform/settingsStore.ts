import { z } from "zod";
import { pool, type Queryable } from "./db.ts";

const localized = z.object({ en: z.string().max(2000), ur: z.string().max(2000) });

export const settingSchemas = {
  store: z.object({
    name: localized,
    tagline: localized,
    email: z.union([z.email(), z.literal("")]),
    phone: z.string().max(40),
    whatsapp: z.string().max(40),
    address: localized,
    logo: z.string().max(300),
    social: z.object({
      facebook: z.string().max(300),
      instagram: z.string().max(300),
      youtube: z.string().max(300),
      tiktok: z.string().max(300),
    }),
    downloadLimit: z.number().int().min(1).max(100),
    accessDays: z.number().int().min(1).max(365),
  }),
  home: z.object({
    heading: localized,
    text: localized,
    primaryCta: localized,
    secondaryCta: localized,
    showNewArrivals: z.boolean(),
    showSale: z.boolean(),
    showHowItWorks: z.boolean(),
    showFormats: z.boolean(),
    showFaq: z.boolean(),
  }),
  announcement: z.object({
    enabled: z.boolean(),
    items: z.array(localized).max(10),
  }),
  faq: z.object({
    items: z.array(z.object({ q: localized, a: localized })).max(30),
  }),
  seo: z.object({
    titleSuffix: z.string().max(60),
    description: localized,
  }),
  smtp: z.object({
    host: z.string().max(200),
    port: z.number().int().min(1).max(65535),
    secure: z.boolean(),
    user: z.string().max(200),
    from: z.string().max(200),
    passEnc: z.string(),
  }),
} as const;

export type SettingKey = keyof typeof settingSchemas;
export type SettingValue<K extends SettingKey> = z.infer<(typeof settingSchemas)[K]>;

const cache = new Map<SettingKey, { value: unknown; at: number }>();
const CACHE_MS = 5_000;

export async function getSetting<K extends SettingKey>(key: K): Promise<SettingValue<K>> {
  const cached = cache.get(key);
  if (cached !== undefined && Date.now() - cached.at < CACHE_MS) {
    return cached.value as SettingValue<K>;
  }
  const result = await pool.query<{ value: unknown }>(`SELECT value FROM settings WHERE key = $1`, [key]);
  const row = result.rows[0];
  if (row === undefined) throw new Error(`Missing settings row "${key}" — run migrations`);
  const value = settingSchemas[key].parse(row.value) as SettingValue<K>;
  cache.set(key, { value, at: Date.now() });
  return value;
}

export async function saveSetting<K extends SettingKey>(
  key: K,
  value: SettingValue<K>,
  db: Queryable = pool,
): Promise<void> {
  const valid = settingSchemas[key].parse(value);
  await db.query(
    `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, JSON.stringify(valid)],
  );
  cache.delete(key);
}
