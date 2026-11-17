import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { FORMATS, getProducts, type ProductQuery } from "@/features/store/data";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { ListingToolbar } from "./ListingToolbar";
import { ProductGrid } from "./ProductCard";

/** Server-rendered, filterable, paginated grid used by category, all-designs and search pages. */
export async function ProductListing({
  query,
  basePath,
  locale,
  t,
}: {
  query: ProductQuery;
  basePath: string;
  locale: Locale;
  t: Dictionary;
}) {
  const result = await getProducts({ ...query, limit: 24 });
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (query.q) params.set("q", query.q);
    if (query.sort && query.sort !== "new") params.set("sort", query.sort);
    if (query.format) params.set("format", query.format);
    if (query.onSale) params.set("sale", "1");
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `${basePath}${qs.length > 0 ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <Suspense fallback={<div className="mb-8 h-[66px] border-y border-line" />}>
        <ListingToolbar
          resultsLabel={t.listing.results(result.total)}
          sortLabel={t.listing.sort}
          sorts={[
            { value: "new", label: t.listing.sortNew },
            { value: "price_asc", label: t.listing.sortPriceAsc },
            { value: "price_desc", label: t.listing.sortPriceDesc },
            { value: "name", label: t.listing.sortName },
          ]}
          formatLabel={t.listing.format}
          formats={[{ value: "", label: t.listing.allFormats }, ...FORMATS.map((format) => ({ value: format, label: format }))]}
          saleLabel={t.listing.onSale}
        />
      </Suspense>

      {result.items.length === 0 ? (
        <p className="card px-6 py-16 text-center text-ink-soft">{t.listing.empty}</p>
      ) : (
        <ProductGrid products={result.items} locale={locale} t={t} priorityCount={query.page === 1 || query.page === undefined ? 4 : 0} />
      )}

      {result.pages > 1 && (
        <nav aria-label={t.listing.page(result.page, result.pages)} className="mt-12 flex items-center justify-center gap-3">
          {result.page > 1 ? (
            <Link href={pageHref(result.page - 1)} className="btn btn-outline" rel="prev">
              <ChevronLeft className="flip-rtl size-4" aria-hidden />
              {t.listing.prev}
            </Link>
          ) : null}
          <span className="text-sm font-semibold text-ink-soft">{t.listing.page(result.page, result.pages)}</span>
          {result.page < result.pages ? (
            <Link href={pageHref(result.page + 1)} className="btn btn-outline" rel="next">
              {t.listing.next}
              <ChevronRight className="flip-rtl size-4" aria-hidden />
            </Link>
          ) : null}
        </nav>
      )}
    </div>
  );
}

export async function listingItems(query: ProductQuery) {
  return (await getProducts({ ...query, limit: 24 })).items;
}
