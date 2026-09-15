import {
  shopPriceMaxCents,
  type ShopProduct,
  type ShopSortId,
  shopStitchFilters,
} from "@/constants/shopCatalog";

export type ShopFilters = {
  categoryId: string;
  formats: readonly string[];
  sizes: readonly string[];
  priceMaxCents: number;
  stitchId: string | null;
  difficulty: string | null;
};

export function createDefaultShopFilters(): ShopFilters {
  return {
    categoryId: "all",
    formats: [],
    sizes: [],
    priceMaxCents: shopPriceMaxCents,
    stitchId: null,
    difficulty: null,
  };
}

export function countActiveShopFilters(
  filters: ShopFilters,
  options?: { ignoreCategory?: boolean },
): number {
  let count = 0;

  if (options?.ignoreCategory !== true && filters.categoryId !== "all") {
    count += 1;
  }

  count += filters.formats.length;
  count += filters.sizes.length;

  if (filters.priceMaxCents < shopPriceMaxCents) {
    count += 1;
  }

  if (filters.stitchId !== null) {
    count += 1;
  }

  if (filters.difficulty !== null) {
    count += 1;
  }

  return count;
}

function matchesStitch(product: ShopProduct, stitchId: string | null): boolean {
  if (stitchId === null) {
    return true;
  }

  const band = shopStitchFilters.find((item) => item.id === stitchId);

  if (band === undefined) {
    return true;
  }

  return product.stitchCount >= band.min && product.stitchCount <= band.max;
}

export function filterShopProducts(
  products: readonly ShopProduct[],
  query: string,
  filters: ShopFilters,
  sortId: ShopSortId,
): ShopProduct[] {
  const needle = query.trim().toLowerCase();

  const matched = products.filter((product) => {
    const matchesQuery =
      needle.length === 0 ||
      product.name.toLowerCase().includes(needle);
    const matchesCategory =
      filters.categoryId === "all" || product.categoryId === filters.categoryId;
    const matchesFormat =
      filters.formats.length === 0 ||
      filters.formats.some((format) => product.formats.includes(format));
    const matchesSize =
      filters.sizes.length === 0 || filters.sizes.includes(product.hoopSize);
    const matchesPrice = product.priceCents <= filters.priceMaxCents;
    const matchesDifficulty = filters.difficulty === null;

    return (
      matchesQuery &&
      matchesCategory &&
      matchesFormat &&
      matchesSize &&
      matchesPrice &&
      matchesStitch(product, filters.stitchId) &&
      matchesDifficulty
    );
  });

  const sorted = [...matched];

  sorted.sort((left, right) => {
    if (sortId === "price-asc") {
      return left.priceCents - right.priceCents;
    }

    if (sortId === "price-desc") {
      return right.priceCents - left.priceCents;
    }

    if (sortId === "best-rated") {
      return right.rating - left.rating;
    }

    return 0;
  });

  return sorted;
}
