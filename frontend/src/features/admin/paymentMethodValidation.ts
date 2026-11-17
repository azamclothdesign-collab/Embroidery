import type { AdminMethod } from "@/features/admin/MethodCard";

type MethodField = AdminMethod["fields"][number];
type MaskedConfig = AdminMethod["config"];

/**
 * Mirrors backend secret merge: empty secret input + already saved = keep (present).
 * Otherwise the trimmed typed value must be non-empty for required fields.
 */
export function effectiveConfigValue(
  field: MethodField,
  typed: string | undefined,
  masked: MaskedConfig,
): string {
  const value = (typed ?? "").trim();
  if (field.secret) {
    if (value.length > 0) return value;
    return masked[field.key]?.set === true ? "__KEPT__" : "";
  }
  return value;
}

export type MethodConfigValidation = {
  ok: boolean;
  errors: Record<string, string>;
  missingLabels: string[];
};

export function validateMethodConfig(
  method: Pick<AdminMethod, "fields" | "config">,
  config: Record<string, string>,
): MethodConfigValidation {
  const errors: Record<string, string> = {};
  const missingLabels: string[] = [];

  for (const field of method.fields) {
    if (!field.required) continue;
    const effective = effectiveConfigValue(field, config[field.key], method.config);
    if (effective.length === 0) {
      errors[field.key] = "Required";
      missingLabels.push(field.label);
    }
  }

  return {
    ok: missingLabels.length === 0,
    errors,
    missingLabels,
  };
}
