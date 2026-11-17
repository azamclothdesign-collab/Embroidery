"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Option = { value: string; label: string };

export function ListingToolbar({
  sortLabel,
  sorts,
  formatLabel,
  formats,
  saleLabel,
  resultsLabel,
}: {
  sortLabel: string;
  sorts: Option[];
  formatLabel: string;
  formats: Option[];
  saleLabel: string;
  resultsLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null || value.length === 0) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    startTransition(() => router.push(`${pathname}${next.size > 0 ? `?${next.toString()}` : ""}`, { scroll: false }));
  };

  return (
    <div className="mb-8 flex flex-col gap-3 border-y border-line py-3 sm:flex-row sm:items-center sm:justify-between" aria-busy={pending}>
      <p className="text-sm font-semibold text-ink-soft" aria-live="polite">
        {resultsLabel}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm font-semibold">
          <input
            type="checkbox"
            className="size-4 accent-saffron-strong"
            checked={params.get("sale") === "1"}
            onChange={(event) => set("sale", event.target.checked ? "1" : null)}
          />
          {saleLabel}
        </label>
        <label className="sr-only" htmlFor="format-filter">
          {formatLabel}
        </label>
        <select
          id="format-filter"
          className="field min-h-11 w-auto rounded-full py-0 text-sm font-semibold"
          value={params.get("format") ?? ""}
          onChange={(event) => set("format", event.target.value)}
        >
          {formats.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="sort-filter">
          {sortLabel}
        </label>
        <select
          id="sort-filter"
          className="field min-h-11 w-auto rounded-full py-0 text-sm font-semibold"
          value={params.get("sort") ?? "new"}
          onChange={(event) => set("sort", event.target.value === "new" ? null : event.target.value)}
        >
          {sorts.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
