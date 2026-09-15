"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import { SearchIcon } from "@/components/icons/SearchIcon";
import {
  type ShopProduct,
  shopRecentSearchesKey,
} from "@/constants/shopCatalog";
import { shopCopy, shopPopularSearches } from "@/constants/shopCopy";
import {
  shopCatalogHref,
  type ShopCatalogQuery,
} from "@/features/shop/shopCatalogQuery";

type ShopSearchProps = {
  locale: string;
  query: string;
  products: readonly ShopProduct[];
  catalog: ShopCatalogQuery;
};

function readRecentSearches(): string[] {
  try {
    const raw = sessionStorage.getItem(shopRecentSearchesKey);

    if (raw === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string").slice(0, 5);
  } catch {
    return [];
  }
}

function rememberSearch(term: string): void {
  const trimmed = term.trim();

  if (trimmed.length === 0) {
    return;
  }

  try {
    const previous = readRecentSearches();
    const next = [trimmed, ...previous.filter((item) => item !== trimmed)].slice(0, 5);
    sessionStorage.setItem(shopRecentSearchesKey, JSON.stringify(next));
  } catch {
    return;
  }
}

export function ShopSearch({ locale, query, products, catalog }: ShopSearchProps) {
  const router = useRouter();
  const listId = useId();
  const [draft, setDraft] = useState(query);
  const [seenQuery, setSeenQuery] = useState(query);
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  if (query !== seenQuery) {
    setSeenQuery(query);
    setDraft(query);
  }

  const matches = products.filter((product) => {
    const needle = draft.trim().toLowerCase();
    return needle.length > 0 && product.name.toLowerCase().includes(needle);
  });

  const commit = (value: string) => {
    rememberSearch(value);
    setDraft(value);
    setIsOpen(false);
    setRecent(readRecentSearches());
    router.replace(
      shopCatalogHref(locale, "/designs", {
        ...catalog,
        q: value,
        page: 1,
      }),
      { scroll: false },
    );
  };

  return (
    <div
      className={`shopHeroCopy relative w-full max-w-[37.5rem] transition-[max-width] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:max-w-[37.5rem]${
        isOpen ? " md:max-w-[47.5rem]" : ""
      }`}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          commit(draft);
        }}
      >
        <label className="sr-only" htmlFor="shop-search">
          {shopCopy.searchLabel}
        </label>
        <div className="flex min-h-14 items-center gap-3 border border-paper/40 bg-paper px-4 text-ink">
          <SearchIcon />
          <input
            id="shop-search"
            type="search"
            role="combobox"
            autoComplete="off"
            maxLength={120}
            value={draft}
            placeholder={shopCopy.searchPlaceholder}
            aria-expanded={isOpen}
            aria-controls={listId}
            aria-autocomplete="list"
            className="min-h-11 w-full bg-transparent text-body text-ink outline-none"
            onFocus={() => {
              setRecent(readRecentSearches());
              setIsOpen(true);
            }}
            onBlur={() => {
              window.setTimeout(() => {
                setIsOpen(false);
              }, 120);
            }}
            onChange={(event) => {
              setDraft(event.target.value);
              setIsOpen(true);
            }}
          />
        </div>
      </form>
      <div
        id={listId}
        className={`fade-rise absolute inset-x-0 top-full z-20 mt-2 border border-line bg-paper p-5 text-left text-ink${isOpen ? " is-visible" : ""}`}
      >
        {matches.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {matches.map((product) => (
              <li key={product.slug}>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center text-left text-body"
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    commit(product.name);
                  }}
                >
                  {product.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
                {shopCopy.popularSearchesHeading}
              </p>
              <ul className="mt-3 flex flex-col gap-1">
                {shopPopularSearches.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-center text-left text-body"
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onClick={() => {
                        commit(term);
                      }}
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {recent.length > 0 ? (
              <div>
                <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
                  {shopCopy.recentSearchesHeading}
                </p>
                <ul className="mt-3 flex flex-col gap-1">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        className="flex min-h-11 w-full items-center text-left text-body"
                        onMouseDown={(event) => {
                          event.preventDefault();
                        }}
                        onClick={() => {
                          commit(term);
                        }}
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
