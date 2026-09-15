import Link from "next/link";

import { TextLink } from "@/components/TextLink";
import { shopCopy, shopEmptySuggestions } from "@/constants/shopCopy";
import {
  clearShopCatalogFilters,
  shopCatalogHref,
  type ShopCatalogQuery,
} from "@/features/shop/shopCatalogQuery";

type ShopEmptyStateProps = {
  locale: string;
  path: string;
  catalog: ShopCatalogQuery;
  kind: "search" | "filters";
};

export function ShopEmptyState({
  locale,
  path,
  catalog,
  kind,
}: ShopEmptyStateProps) {
  const browseHref = shopCatalogHref(locale, "/designs", {
    q: "",
    sortId: "popular",
    page: 1,
    filters: clearShopCatalogFilters(catalog).filters,
  });
  const clearHref = shopCatalogHref(
    locale,
    path,
    clearShopCatalogFilters(catalog, catalog.filters.categoryId),
  );

  if (kind === "filters") {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h2 className="text-title-sm font-medium tracking-tight text-ink">
          {shopCopy.emptyFilterHeading}
        </h2>
        <p className="mt-4 text-body leading-8 text-ink-soft">
          {shopCopy.emptyFilterBody}
        </p>
        <div className="mt-8">
          <TextLink href={clearHref}>{shopCopy.clearFilters}</TextLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h2 className="text-title-sm font-medium tracking-tight text-ink">
        {shopCopy.emptySearchHeading}
      </h2>
      <p className="mt-4 text-body leading-8 text-ink-soft">
        {shopCopy.emptySearchBodyPrefix} “{catalog.q}”.
      </p>
      <p className="mt-2 text-body text-ink-soft">{shopCopy.emptySearchHint}</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-2">
        {shopEmptySuggestions.map((term) => (
          <li key={term}>
            <Link
              href={shopCatalogHref(locale, "/designs", {
                ...catalog,
                q: term,
                page: 1,
                filters: clearShopCatalogFilters(catalog).filters,
              })}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-meta uppercase tracking-[0.14em]"
            >
              {term}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <TextLink href={browseHref}>{shopCopy.browseAll}</TextLink>
      </div>
    </div>
  );
}
