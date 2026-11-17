"use client";

import type { ReactNode } from "react";

/** Small, accessible form primitives shared by admin editors. */
export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  help,
  dir,
  type = "text",
  maxLength,
  required = false,
  placeholder,
  prefix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  help?: string;
  dir?: "ltr" | "rtl" | "auto";
  type?: string;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <div className="relative">
        {prefix !== undefined && <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted">{prefix}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={prefix !== undefined ? "field ps-12" : "field"}
          aria-invalid={error !== undefined}
          aria-required={required || undefined}
          aria-describedby={`${id}-hint`}
          {...(dir === undefined ? {} : { dir })}
          {...(maxLength === undefined ? {} : { maxLength })}
          {...(placeholder === undefined ? {} : { placeholder })}
          {...(type === "number" ? { inputMode: "decimal" as const } : {})}
        />
      </div>
      <Hint id={`${id}-hint`} error={error} help={help} count={maxLength === undefined ? undefined : `${value.length}/${maxLength}`} />
    </div>
  );
}

export function TextArea({
  id,
  label,
  value,
  onChange,
  rows = 5,
  dir,
  help,
  error,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  dir?: "ltr" | "rtl" | "auto";
  help?: string;
  error?: string | undefined;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}</label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="field py-3 leading-relaxed"
        aria-invalid={error !== undefined}
        aria-describedby={`${id}-hint`}
        {...(dir === undefined ? {} : { dir })}
        {...(maxLength === undefined ? {} : { maxLength })}
      />
      <Hint id={`${id}-hint`} error={error} help={help} count={maxLength === undefined ? undefined : `${value.length}/${maxLength}`} />
    </div>
  );
}

function Hint({ id, error, help, count }: { id: string; error?: string | undefined; help?: string | undefined; count?: string | undefined }) {
  if (error === undefined && help === undefined && count === undefined) return null;
  return (
    <div id={id} className="mt-1.5 flex justify-between gap-3 text-sm">
      <span className={error !== undefined ? "font-semibold text-danger" : "text-muted"}>{error ?? help ?? ""}</span>
      {count !== undefined && <span className="shrink-0 text-xs text-muted">{count}</span>}
    </div>
  );
}

export function Toggle({ id, label, checked, onChange, help }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; help?: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 rounded-xl py-1">
      <span>
        <span className="block font-semibold">{label}</span>
        {help !== undefined && <span className="block text-sm text-muted">{help}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-7 w-12 rounded-full bg-line transition peer-checked:bg-teal peer-focus-visible:ring-4 peer-focus-visible:ring-saffron/30" />
        <span className="absolute start-1 top-1 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
    </label>
  );
}

export function BilingualRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** "2,999" / "2999.50" → 299950 paisa; invalid → null */
export function toMinor(value: string): number | null {
  const cleaned = value.replaceAll(",", "").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(Number.parseFloat(cleaned) * 100);
}

export function fromMinor(minor: number | null): string {
  return minor === null ? "" : String(minor / 100);
}

export function SeoPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4" aria-label="Search result preview">
      <p className="truncate text-xs text-muted" dir="ltr">{url}</p>
      <p className="mt-1 truncate text-lg text-[#1a0dab]">{title || "Title"}</p>
      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{description || "Description shown in Google and AI search results."}</p>
    </div>
  );
}
