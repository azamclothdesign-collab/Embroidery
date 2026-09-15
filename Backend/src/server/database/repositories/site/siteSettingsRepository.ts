import { pool } from "../../pool.js";

import { type SiteSettingsKey } from "../../../../types/siteSettings.js";

export async function readSiteSettings<TValue>(
  key: SiteSettingsKey,
): Promise<TValue | null> {
  const result = await pool.query<{ value: TValue }>(
    `SELECT value
     FROM site_settings
     WHERE key = $1`,
    [key],
  );

  const row = result.rows[0];
  return row === undefined ? null : row.value;
}

export async function writeSiteSettings<TValue>(
  key: SiteSettingsKey,
  value: TValue,
): Promise<TValue> {
  const result = await pool.query<{ value: TValue }>(
    `INSERT INTO site_settings (key, value)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (key)
     DO UPDATE SET value = EXCLUDED.value
     RETURNING value`,
    [key, JSON.stringify(value)],
  );

  const row = result.rows[0];

  if (row === undefined) {
    throw new Error("site_settings_write_failed");
  }

  return row.value;
}
