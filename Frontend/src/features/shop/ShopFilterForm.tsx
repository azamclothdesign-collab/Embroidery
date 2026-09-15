import {
  formatDesignCount,
  shopDifficultyOptions,
  shopFormatOptions,
  shopPriceMaxCents,
  shopSizeOptions,
  shopStitchFilters,
} from "@/constants/shopCatalog";
import { shopCopy } from "@/constants/shopCopy";
import {
  clearShopCatalogFilters,
  shopCatalogHref,
  type ShopCatalogQuery,
} from "@/features/shop/shopCatalogQuery";
import { ShopFilterGroup } from "@/features/shop/ShopFilterGroup";

type ShopFilterFormProps = {
  locale: string;
  path: string;
  catalog: ShopCatalogQuery;
  resultCount: number;
};

export function ShopFilterForm({
  locale,
  path,
  catalog,
  resultCount,
}: ShopFilterFormProps) {
  const priceDollars = Math.round(catalog.filters.priceMaxCents / 100);
  const clearHref = shopCatalogHref(
    locale,
    path,
    clearShopCatalogFilters(catalog, catalog.filters.categoryId),
  );
  const action = `/${locale}${path}`;

  return (
    <details className="site-filter-menu relative">
      <summary className="flex min-h-11 cursor-pointer list-none items-center border border-ink px-5 text-meta uppercase tracking-[0.14em] [&::-webkit-details-marker]:hidden">
        {catalog.filters.formats.length +
          catalog.filters.sizes.length +
          (catalog.filters.priceMaxCents < shopPriceMaxCents ? 1 : 0) +
          (catalog.filters.stitchId !== null ? 1 : 0) +
          (catalog.filters.difficulty !== null ? 1 : 0) >
        0
          ? `${shopCopy.filters} · ${
              catalog.filters.formats.length +
              catalog.filters.sizes.length +
              (catalog.filters.priceMaxCents < shopPriceMaxCents ? 1 : 0) +
              (catalog.filters.stitchId !== null ? 1 : 0) +
              (catalog.filters.difficulty !== null ? 1 : 0)
            }`
          : shopCopy.filters}
      </summary>
      <form
        method="get"
        action={action}
        className="absolute right-0 z-30 mt-2 w-[min(28rem,calc(100vw-3rem))] border border-line bg-paper shadow-sm"
      >
        {catalog.q.trim().length > 0 ? (
          <input type="hidden" name="q" value={catalog.q.trim()} />
        ) : null}
        {catalog.sortId !== "popular" ? (
          <input type="hidden" name="sort" value={catalog.sortId} />
        ) : null}
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-6">
          <ShopFilterGroup title="Format">
            {shopFormatOptions.map((format) => (
              <label key={format} className="flex min-h-11 items-center gap-3 text-body">
                <input
                  type="checkbox"
                  name="format"
                  value={format}
                  defaultChecked={catalog.filters.formats.includes(format)}
                />
                {format}
              </label>
            ))}
          </ShopFilterGroup>
          <ShopFilterGroup title="Size">
            {shopSizeOptions.map((size) => (
              <label key={size} className="flex min-h-11 items-center gap-3 text-body">
                <input
                  type="checkbox"
                  name="size"
                  value={size}
                  defaultChecked={catalog.filters.sizes.includes(size)}
                />
                {size}
              </label>
            ))}
          </ShopFilterGroup>
          <ShopFilterGroup title="Price">
            <label className="flex flex-col gap-3 text-body">
              <span>
                $0 — ${priceDollars}
                {catalog.filters.priceMaxCents >= shopPriceMaxCents ? "+" : ""}
              </span>
              <input
                type="range"
                name="price"
                min={0}
                max={Math.round(shopPriceMaxCents / 100)}
                defaultValue={priceDollars}
                className="accent-accent"
              />
            </label>
          </ShopFilterGroup>
          <ShopFilterGroup title="Stitch Count">
            {shopStitchFilters.map((band) => (
              <label key={band.id} className="flex min-h-11 items-center gap-3 text-body">
                <input
                  type="radio"
                  name="stitch"
                  value={band.id}
                  defaultChecked={catalog.filters.stitchId === band.id}
                />
                {band.label}
              </label>
            ))}
          </ShopFilterGroup>
          <ShopFilterGroup title="Difficulty">
            {shopDifficultyOptions.map((level) => (
              <label key={level} className="flex min-h-11 items-center gap-3 text-body">
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  defaultChecked={catalog.filters.difficulty === level}
                />
                {level}
              </label>
            ))}
          </ShopFilterGroup>
        </div>
        <div className="flex gap-3 border-t border-line bg-paper px-6 py-4">
          <a
            href={clearHref}
            className="inline-flex min-h-11 flex-1 items-center justify-center border border-ink px-6 font-nourd text-base tracking-wide"
          >
            {shopCopy.clearFilters}
          </a>
          <button
            type="submit"
            className="inline-flex min-h-11 flex-1 items-center justify-center bg-ink px-6 font-nourd text-base tracking-wide text-paper"
          >
            Show {formatDesignCount(resultCount)}
          </button>
        </div>
      </form>
    </details>
  );
}
