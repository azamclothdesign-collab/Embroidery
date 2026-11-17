"use client";

import { CheckCircle2, Copy, KeyRound, Loader2, PlugZap, Save, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveMethodAction, testMethodAction } from "@/actions/admin";
import { cn } from "@/lib/cn";
import { validateMethodConfig } from "@/features/admin/paymentMethodValidation";
import { BilingualRow, TextArea, TextField, Toggle } from "./fields";

export type AdminMethod = {
  code: string;
  kind: "gateway" | "manual";
  enabled: boolean;
  mode: "sandbox" | "live";
  sortOrder: number;
  label: { en: string; ur: string };
  instructions: { en: string; ur: string };
  config: Record<string, { set: boolean; value: string }>;
  fields: Array<{ key: string; label: string; secret: boolean; required: boolean; help?: string }>;
  missing: string[];
  callbackUrls: string[];
};

function mapApiFieldErrors(
  fields: Record<string, string> | undefined,
): Record<string, string> {
  if (fields === undefined) return {};
  const mapped: Record<string, string> = {};
  for (const [key, message] of Object.entries(fields)) {
    mapped[key.startsWith("config.") ? key.slice("config.".length) : key] = message;
  }
  return mapped;
}

export function MethodCard({ method }: { method: AdminMethod }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [v, setV] = useState({
    enabled: method.enabled,
    mode: method.mode,
    sortOrder: method.sortOrder,
    labelEn: method.label.en,
    labelUr: method.label.ur,
    instructionsEn: method.instructions.en,
    instructionsUr: method.instructions.ur,
  });
  const [config, setConfig] = useState<Record<string, string>>(() =>
    Object.fromEntries(method.fields.map((f) => [f.key, f.secret ? "" : (method.config[f.key]?.value ?? "")])),
  );
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => setV((current) => ({ ...current, [key]: value }));

  const updateConfig = (key: string, value: string) => {
    setConfig((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (current[key] === undefined) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const save = () =>
    startTransition(async () => {
      const local = validateMethodConfig(method, config);
      if (!local.ok) {
        setFieldErrors(local.errors);
        toast.error(`Fill these required fields: ${local.missingLabels.join(", ")}`);
        return;
      }

      const result = await saveMethodAction(method.code, { ...v, config });
      if (!result.ok) {
        setFieldErrors(mapApiFieldErrors(result.fields));
        toast.error(result.message);
        return;
      }

      setFieldErrors({});
      toast.success(`${v.labelEn} saved`);
      setConfig((current) =>
        Object.fromEntries(
          Object.entries(current).map(([k, val]) => [
            k,
            method.fields.find((f) => f.key === k)?.secret ? "" : val,
          ]),
        ),
      );
      router.refresh();
    });

  const runTest = async () => {
    setTesting(true);
    setTest(null);
    const result = await testMethodAction(method.code);
    setTesting(false);
    if (!result.ok) return void toast.error(result.message);
    setTest(result.data as { ok: boolean; message: string });
  };

  return (
    <section className={cn("card p-5 sm:p-6", v.enabled && "ring-2 ring-teal/40")} aria-labelledby={`method-${method.code}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id={`method-${method.code}`} className="text-lg">{method.label.en}</h2>
          <p className="text-sm text-muted">{method.kind === "gateway" ? "Online gateway — payments confirmed automatically" : "Manual — you confirm payment in Orders"}</p>
        </div>
        <div className="w-full max-w-[220px]">
          <Toggle id={`${method.code}-enabled`} label={v.enabled ? "Active at checkout" : "Off"} checked={v.enabled} onChange={(value) => set("enabled", value)} />
        </div>
      </div>

      {method.missing.length > 0 && <p className="mt-3 rounded-lg bg-gold-soft px-3 py-2 text-sm">Needs: {method.missing.join(", ")}</p>}

      <div className="mt-5 space-y-4">
        {method.kind === "gateway" && (
          <fieldset>
            <legend className="field-label">Mode</legend>
            <div className="inline-flex rounded-full border border-line p-1">
              {(["sandbox", "live"] as const).map((mode) => (
                <label key={mode} className={cn("cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold capitalize", v.mode === mode ? (mode === "live" ? "bg-success text-white" : "bg-ink text-white") : "text-ink-soft")}>
                  <input type="radio" className="sr-only" name={`${method.code}-mode`} checked={v.mode === mode} onChange={() => set("mode", mode)} />
                  {mode === "sandbox" ? "Sandbox (test)" : "Live (real money)"}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {method.fields.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {method.fields.map((field) => {
              const secretSaved = field.secret && method.config[field.key]?.set === true;
              const showRequired = field.required && !secretSaved;
              const error = fieldErrors[field.key];
              return (
                <div key={field.key}>
                  <TextField
                    id={`${method.code}-${field.key}`}
                    label={field.label}
                    required={showRequired}
                    type={field.secret ? "password" : "text"}
                    dir="ltr"
                    value={config[field.key] ?? ""}
                    placeholder={secretSaved ? "•••••••• saved — leave empty to keep" : ""}
                    onChange={(value) => updateConfig(field.key, value)}
                    {...(error !== undefined ? { error } : {})}
                    {...(field.help !== undefined ? { help: field.help } : {})}
                  />
                  {secretSaved ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-success">
                      <KeyRound className="size-3" aria-hidden /> Encrypted and saved
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <details className="rounded-xl border border-line p-4">
          <summary className="cursor-pointer font-semibold">Checkout label and instructions</summary>
          <div className="mt-4 space-y-4">
            <BilingualRow>
              <TextField id={`${method.code}-labelEn`} label="Label (English)" value={v.labelEn} maxLength={80} onChange={(value) => set("labelEn", value)} />
              <TextField id={`${method.code}-labelUr`} label="Label (Urdu)" dir="rtl" value={v.labelUr} maxLength={80} onChange={(value) => set("labelUr", value)} />
            </BilingualRow>
            <BilingualRow>
              <TextArea id={`${method.code}-insEn`} label="Instructions (English)" rows={3} value={v.instructionsEn} maxLength={1000} onChange={(value) => set("instructionsEn", value)} />
              <TextArea id={`${method.code}-insUr`} label="Instructions (Urdu)" dir="rtl" rows={3} value={v.instructionsUr} maxLength={1000} onChange={(value) => set("instructionsUr", value)} />
            </BilingualRow>
            <TextField id={`${method.code}-sort`} label="Position at checkout" type="number" dir="ltr" value={String(v.sortOrder)} onChange={(value) => set("sortOrder", Math.min(99, Math.max(0, Number.parseInt(value || "0", 10) || 0)))} />
          </div>
        </details>

        {method.callbackUrls.length > 0 && (
          <div className="rounded-xl bg-sand/60 p-4 text-sm">
            <p className="font-semibold">Callback URLs — paste these in the {method.label.en} merchant portal</p>
            <ul className="mt-2 space-y-1.5">
              {method.callbackUrls.map((url) => (
                <li key={url} className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded bg-paper px-2 py-1 text-xs" dir="ltr">{url}</code>
                  <button type="button" className="icon-btn size-9" aria-label="Copy URL" onClick={() => void navigator.clipboard.writeText(url).then(() => toast.success("Copied"))}>
                    <Copy className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {test !== null && (
          <p role="status" className={cn("flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-semibold", test.ok ? "bg-teal-soft text-teal" : "bg-danger-soft text-danger")}>
            {test.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden /> : <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden />}
            {test.message}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />} Save
          </button>
          {method.kind === "gateway" && (
            <button type="button" className="btn btn-outline" onClick={() => void runTest()} disabled={testing}>
              {testing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <PlugZap className="size-4" aria-hidden />} Test saved credentials
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
