import { z } from "zod";
import { config } from "../../platform/config.ts";
import { decryptSecret, encryptSecret } from "../../platform/crypto.ts";
import { pool } from "../../platform/db.ts";
import { badRequest, notFound, unavailable } from "../../platform/errors.ts";
import { METHOD_CODES, METHOD_SPECS, type MethodCode } from "./methodSpecs.ts";

type Localized = { en: string; ur: string };

export type MethodConfig = Record<string, string>;

export type PaymentMethod = {
  code: MethodCode;
  kind: "gateway" | "manual";
  enabled: boolean;
  mode: "sandbox" | "live";
  sortOrder: number;
  label: Localized;
  instructions: Localized;
  config: MethodConfig;
};

type Row = {
  code: MethodCode;
  enabled: boolean;
  mode: "sandbox" | "live";
  sort_order: number;
  label_en: string;
  label_ur: string;
  instructions_en: string;
  instructions_ur: string;
  config_enc: string;
};

function readConfig(sealed: string): MethodConfig {
  if (sealed.length === 0) return {};
  try {
    const parsed: unknown = JSON.parse(decryptSecret(sealed));
    return z.record(z.string(), z.string()).parse(parsed);
  } catch {
    // Key rotated or data corrupted: treat as empty so admin can re-enter.
    console.error(JSON.stringify({ level: "error", msg: "payment config could not be decrypted" }));
    return {};
  }
}

function toMethod(row: Row): PaymentMethod {
  return {
    code: row.code,
    kind: METHOD_SPECS[row.code].kind,
    enabled: row.enabled,
    mode: row.mode,
    sortOrder: row.sort_order,
    label: { en: row.label_en, ur: row.label_ur },
    instructions: { en: row.instructions_en, ur: row.instructions_ur },
    config: readConfig(row.config_enc),
  };
}

export async function listMethods(): Promise<PaymentMethod[]> {
  const result = await pool.query<Row>(`SELECT * FROM payment_methods ORDER BY sort_order, code`);
  return result.rows.map(toMethod);
}

export async function getMethod(code: MethodCode): Promise<PaymentMethod> {
  const result = await pool.query<Row>(`SELECT * FROM payment_methods WHERE code = $1`, [code]);
  const row = result.rows[0];
  if (row === undefined) throw notFound("Payment method");
  return toMethod(row);
}

export function missingFields(method: PaymentMethod): string[] {
  return METHOD_SPECS[method.code].fields
    .filter((spec) => spec.required && (method.config[spec.key] ?? "").trim().length === 0)
    .map((spec) => spec.label);
}

/** Loads a method for checkout; refuses when it is off or not fully configured. */
export async function requireActiveMethod(code: MethodCode): Promise<PaymentMethod> {
  const method = await getMethod(code);
  if (!method.enabled) throw unavailable("method_disabled", "This payment method is not available right now");
  if (missingFields(method).length > 0) throw unavailable("method_not_configured", "This payment method is not set up yet");
  return method;
}

/** What the checkout page may see. Bank account details are public by design. */
export async function publicMethods(): Promise<
  Array<{ code: MethodCode; kind: string; label: Localized; instructions: Localized; details: MethodConfig }>
> {
  const methods = await listMethods();
  return methods
    .filter((method) => method.enabled && missingFields(method).length === 0)
    .map((method) => ({
      code: method.code,
      kind: method.kind,
      label: method.label,
      instructions: method.instructions,
      details: Object.fromEntries(
        METHOD_SPECS[method.code].fields.filter((spec) => spec.public).map((spec) => [spec.key, method.config[spec.key] ?? ""]),
      ),
    }));
}

/** Admin view: secrets replaced by a "set / not set" flag. */
export function maskForAdmin(method: PaymentMethod) {
  const spec = METHOD_SPECS[method.code];
  return {
    ...method,
    config: Object.fromEntries(
      spec.fields.map((fieldSpec) => {
        const value = method.config[fieldSpec.key] ?? "";
        return [fieldSpec.key, fieldSpec.secret ? { set: value.length > 0, value: "" } : { set: value.length > 0, value }];
      }),
    ),
    fields: spec.fields,
    missing: missingFields(method),
    callbackUrls: (spec.callbackPaths ?? []).map((pathName) => `${config.SITE_URL}${pathName}`),
  };
}

export const methodUpdate = z.object({
  enabled: z.boolean(),
  mode: z.enum(["sandbox", "live"]),
  sortOrder: z.number().int().min(0).max(99),
  labelEn: z.string().trim().min(1).max(80),
  labelUr: z.string().trim().max(80),
  instructionsEn: z.string().trim().max(1000),
  instructionsUr: z.string().trim().max(1000),
  /** Empty string for a secret field = keep the saved value. */
  config: z.record(z.string(), z.string().trim().max(500)),
});

export async function saveMethod(code: MethodCode, input: z.infer<typeof methodUpdate>): Promise<PaymentMethod> {
  const current = await getMethod(code);
  const spec = METHOD_SPECS[code];
  const next: MethodConfig = {};
  for (const fieldSpec of spec.fields) {
    const incoming = input.config[fieldSpec.key];
    const keep = fieldSpec.secret && (incoming === undefined || incoming.length === 0);
    next[fieldSpec.key] = keep ? (current.config[fieldSpec.key] ?? "") : (incoming ?? "");
  }
  if (code === "easypaisa" && (next.hashKey ?? "").length > 0 && ![16, 24, 32].includes((next.hashKey ?? "").length)) {
    throw badRequest("invalid_hash_key", "Easypaisa hash key must be 16 characters", { "config.hashKey": "Must be 16 characters" });
  }

  const candidate: PaymentMethod = { ...current, config: next };
  const missing = missingFields(candidate);
  if (input.enabled && missing.length > 0) {
    throw badRequest("method_incomplete", `Fill these before enabling: ${missing.join(", ")}`);
  }

  await pool.query(
    `UPDATE payment_methods SET enabled=$2, mode=$3, sort_order=$4, label_en=$5, label_ur=$6,
       instructions_en=$7, instructions_ur=$8, config_enc=$9 WHERE code=$1`,
    [
      code,
      input.enabled,
      input.mode,
      input.sortOrder,
      input.labelEn,
      input.labelUr,
      input.instructionsEn,
      input.instructionsUr,
      encryptSecret(JSON.stringify(next)),
    ],
  );
  return getMethod(code);
}

export function isMethodCode(value: string): value is MethodCode {
  return (METHOD_CODES as readonly string[]).includes(value);
}
