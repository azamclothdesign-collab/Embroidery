import { pool } from "../../pool.js";

import { type AccountSettings } from "../../../../types/account.js";

type PreferencesRow = {
  display_name: string;
  country: string;
  preferred_format: string;
  remember_format: boolean;
  open_download_instructions: boolean;
  first_name: string;
  last_name: string;
};

export async function findAccountSettings(
  customerId: string,
): Promise<AccountSettings | null> {
  const result = await pool.query<PreferencesRow>(
    `SELECT cp.display_name, cp.country, cp.preferred_format, cp.remember_format,
            cp.open_download_instructions, c.first_name, c.last_name
     FROM customer_preferences cp
     INNER JOIN customers c ON c.id = cp.customer_id
     WHERE cp.customer_id = $1`,
    [customerId],
  );

  const row = result.rows[0];

  if (row === undefined) {
    return null;
  }

  const preferredFormat =
    row.preferred_format === "PES" ||
    row.preferred_format === "DST" ||
    row.preferred_format === "JEF" ||
    row.preferred_format === "all"
      ? row.preferred_format
      : "all";

  return {
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    country: row.country,
    preferredFormat,
    rememberFormat: row.remember_format,
    openDownloadInstructions: row.open_download_instructions,
  };
}

export async function updateAccountSettings(input: {
  customerId: string;
  settings: AccountSettings;
}): Promise<AccountSettings> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE customers
       SET first_name = $2,
           last_name = $3
       WHERE id = $1`,
      [input.customerId, input.settings.firstName, input.settings.lastName],
    );

    await client.query(
      `UPDATE customer_preferences
       SET display_name = $2,
           country = $3,
           preferred_format = $4,
           remember_format = $5,
           open_download_instructions = $6
       WHERE customer_id = $1`,
      [
        input.customerId,
        input.settings.displayName,
        input.settings.country,
        input.settings.preferredFormat,
        input.settings.rememberFormat,
        input.settings.openDownloadInstructions,
      ],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const settings = await findAccountSettings(input.customerId);

  if (settings === null) {
    throw new Error("account_settings_update_failed");
  }

  return settings;
}
