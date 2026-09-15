"use client";

import { useId, useMemo, useState } from "react";

import { SearchIcon } from "@/components/icons/SearchIcon";
import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import {
  brandSelection,
  findBrandById,
  machineCompatibilityPopularBrandIds,
  type MachineSelection,
  searchMachineCatalog,
} from "@/constants/machineCompatibilityCatalog";
import { machineCompatibilityPageCopy } from "@/constants/machineCompatibilityPageCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type MachineFinderToolProps = {
  locale: string;
  selection: MachineSelection | null;
  onSelect: (selection: MachineSelection) => void;
  onClear: () => void;
  variant?: "full" | "compact";
  resultId?: string;
  showDisclaimer?: boolean;
};

export function MachineFinderTool({
  locale,
  selection,
  onSelect,
  onClear,
  variant = "full",
  resultId = "machine-finder-result",
  showDisclaimer = true,
}: MachineFinderToolProps) {
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const results = useMemo(() => searchMachineCatalog(query), [query]);
  const isCompact = variant === "compact";

  return (
    <div
      className={
        isCompact
          ? "machineFinder border border-line bg-paper p-5 md:p-6"
          : "machineFinder border border-line bg-surface p-6 md:p-8"
      }
    >
      <p className="text-meta uppercase tracking-[0.18em] text-ink-soft">
        {machineCompatibilityPageCopy.finderLabel}
      </p>
      <label htmlFor={inputId} className="sr-only">
        {machineCompatibilityPageCopy.searchPlaceholder}
      </label>
      <div className="relative mt-4">
        <input
          id={inputId}
          type="search"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder={machineCompatibilityPageCopy.searchPlaceholder}
          className="min-h-12 w-full border border-line bg-paper px-4 pr-12 text-body text-ink outline-none focus-visible:border-ink"
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setIsOpen(false);
            }, 120);
          }}
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink-soft"
          aria-hidden="true"
        >
          <SearchIcon />
        </span>
        {isOpen && query.trim().length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-2 max-h-64 w-full list-none overflow-auto border border-line bg-paper p-0 shadow-sm"
          >
            {results.length === 0 ? (
              <li className="px-4 py-3 text-meta text-ink-soft">
                {machineCompatibilityPageCopy.noResults}
              </li>
            ) : (
              results.map((item) => (
                <li key={item.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between gap-4 px-4 py-3 text-left text-body text-ink hover:bg-paper"
                    onMouseDown={(event) => {
                      event.preventDefault();
                    }}
                    onClick={() => {
                      onSelect(item);
                      setQuery(item.label);
                      setIsOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                      {item.format}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      <p className="mt-6 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {machineCompatibilityPageCopy.popularLabel}
      </p>
      <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
        {machineCompatibilityPopularBrandIds.map((brandId) => {
          const brand = findBrandById(brandId);

          if (brand === undefined) {
            return null;
          }

          return (
            <li key={brand.id}>
              <button
                type="button"
                className="min-h-11 border border-line px-4 text-meta uppercase tracking-[0.14em] text-ink hover:border-ink"
                onClick={() => {
                  onSelect(brandSelection(brand));
                  setQuery(brand.name);
                }}
              >
                {brand.name}
              </button>
            </li>
          );
        })}
      </ul>

      {selection !== null ? (
        <div
          id={resultId}
          className={
            isCompact
              ? "hero-copy-enter mt-8 border-t border-line pt-8"
              : "hero-copy-enter mt-10 border-t border-line pt-10"
          }
          aria-live="polite"
        >
          <p className="text-meta uppercase tracking-[0.18em] text-accent">
            {machineCompatibilityPageCopy.yourMachine}
          </p>
          <p className="mt-3 text-h3 font-medium tracking-tight text-ink">
            {selection.label}
          </p>
          <div
            className={
              isCompact
                ? "mt-6 border border-line bg-surface px-5 py-8 text-center"
                : "mt-8 border border-line bg-paper px-6 py-10 text-center md:px-10"
            }
          >
            <p className="text-meta uppercase tracking-[0.18em] text-ink-soft">
              {machineCompatibilityPageCopy.recommendedFormat}
            </p>
            <p
              className={
                isCompact
                  ? "mt-3 text-title-sm font-medium tracking-tight text-ink"
                  : "mt-4 text-title-md font-medium tracking-tight text-ink md:text-title-lg"
              }
            >
              {selection.format}
            </p>
            {!isCompact ? (
              <>
                <p className="mt-4 text-meta uppercase tracking-[0.14em] text-ink">
                  ✓ {machineCompatibilityPageCopy.compatibleFormat}
                </p>
                <p className="mx-auto mt-4 max-w-md text-body leading-8 text-ink-soft">
                  {machineCompatibilityPageCopy.formatUsesPrefix} {selection.format}{" "}
                  {machineCompatibilityPageCopy.formatUsesSuffix}
                </p>
              </>
            ) : null}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <TextLink
                href={`/${locale}${shopDesignsHref}?q=${encodeURIComponent(selection.format)}`}
              >
                {machineCompatibilityPageCopy.browseFormatPrefix} {selection.format}{" "}
                {machineCompatibilityPageCopy.browseFormatSuffix}
              </TextLink>
              <TextButton
                tone="ghostOnLight"
                onClick={() => {
                  onClear();
                  setQuery("");
                }}
              >
                {machineCompatibilityPageCopy.chooseAnother}
              </TextButton>
            </div>
          </div>
          {showDisclaimer ? (
            <p className="mt-6 max-w-2xl text-meta leading-6 text-ink-soft">
              {machineCompatibilityPageCopy.disclaimer}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
