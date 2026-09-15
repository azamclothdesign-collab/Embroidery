import {
  isShopSortId,
  shopDifficultyOptions,
  shopFormatOptions,
  shopPriceMaxCents,
  type ShopProduct,
  shopSizeOptions,
  type ShopSortId,
  shopStitchFilters,
} from "@/constants/shopCatalog";
import {
  countActiveShopFilters,
  createDefaultShopFilters,
  filterShopProducts,
  type ShopFilters,
} from "@/features/shop/filterShopProducts";

export type ShopCatalogQuery = {
  q: string;
  sortId: ShopSortId;
  page: number;
  filters: ShopFilters;
};

const formatSet = new Set<string>(shopFormatOptions);
const sizeSet = new Set<string>(shopSizeOptions);
const stitchSet = new Set<string>(shopStitchFilters.map((item) => item.id));
const difficultySet = new Set<string>(shopDifficultyOptions);

function readString(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readList(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  const parts = Array.isArray(value) ? value : [value];

  return parts
    .flatMap((part) => part.split(","))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function parseShopCatalogSearchParams(
  raw: Record<string, string | string[] | undefined>,
  options?: { q?: string; categoryId?: string },
): ShopCatalogQuery {
  const sortValue = readString(raw.sort);
  const sortId = sortValue !== undefined && isShopSortId(sortValue) ? sortValue : "popular";
  const pageRaw = readString(raw.page);
  const pageParsed = pageRaw === undefined ? 1 : Number.parseInt(pageRaw, 10);
  const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;
  const priceRaw = readString(raw.price);
  const priceDollars =
    priceRaw === undefined ? Math.round(shopPriceMaxCents / 100) : Number.parseInt(priceRaw, 10);
  const priceMaxCents =
    Number.isFinite(priceDollars) && priceDollars >= 0
      ? Math.min(priceDollars * 100, shopPriceMaxCents)
      : shopPriceMaxCents;
  const stitchValue = readString(raw.stitch);
  const difficultyValue = readString(raw.difficulty);

  return {
    q: options?.q ?? "",
    sortId,
    page,
    filters: {
      categoryId: options?.categoryId ?? "all",
      formats: readList(raw.format).filter((item) => formatSet.has(item.toUpperCase())).map((item) => item.toUpperCase()),
      sizes: readList(raw.size).filter((item) => sizeSet.has(item)),
      priceMaxCents,
      stitchId:
        stitchValue !== undefined && stitchSet.has(stitchValue) ? stitchValue : null,
      difficulty:
        difficultyValue !== undefined && difficultySet.has(difficultyValue)
          ? difficultyValue
          : null,
    },
  };
}

export function shopCatalogSearchString(catalog: ShopCatalogQuery): string {
  const params = new URLSearchParams();

  if (catalog.q.trim().length > 0) {
    params.set("q", catalog.q.trim());
  }

  if (catalog.sortId !== "popular") {
    params.set("sort", catalog.sortId);
  }

  if (catalog.page > 1) {
    params.set("page", String(catalog.page));
  }

  for (const format of catalog.filters.formats) {
    params.append("format", format);
  }

  for (const size of catalog.filters.sizes) {
    params.append("size", size);
  }

  if (catalog.filters.priceMaxCents < shopPriceMaxCents) {
    params.set("price", String(Math.round(catalog.filters.priceMaxCents / 100)));
  }

  if (catalog.filters.stitchId !== null) {
    params.set("stitch", catalog.filters.stitchId);
  }

  if (catalog.filters.difficulty !== null) {
    params.set("difficulty", catalog.filters.difficulty);
  }

  return params.toString();
}

export function shopCatalogHref(
  locale: string,
  path: string,
  catalog: ShopCatalogQuery,
): string {
  const search = shopCatalogSearchString(catalog);
  return search.length > 0 ? `/${locale}${path}?${search}` : `/${locale}${path}`;
}

export function resolveShopCatalog(
  products: readonly ShopProduct[],
  catalog: ShopCatalogQuery,
  pageSize: number,
): {
  matched: ShopProduct[];
  visible: ShopProduct[];
  activeFilterCount: number;
} {
  const matched = filterShopProducts(
    products,
    catalog.q,
    catalog.filters,
    catalog.sortId,
  );
  const visibleCount = catalog.page * pageSize;

  return {
    matched,
    visible: matched.slice(0, visibleCount),
    activeFilterCount: countActiveShopFilters(catalog.filters, {
      ignoreCategory: catalog.filters.categoryId !== "all",
    }),
  };
}

export function clearShopCatalogFilters(
  catalog: ShopCatalogQuery,
  categoryId: string = "all",
): ShopCatalogQuery {
  return {
    ...catalog,
    page: 1,
    filters: {
      ...createDefaultShopFilters(),
      categoryId,
    },
  };
}
