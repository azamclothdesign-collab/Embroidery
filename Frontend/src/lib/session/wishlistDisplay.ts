import {
  type ShopProduct,
} from "@/constants/shopCatalog";
import { type WishlistItem } from "@/types/api/wishlist";

export type WishlistDisplayItem = {
  slug: string;
  savedAt: string;
  available: boolean;
  product: ShopProduct | null;
};

export type WishlistSortId = "recent" | "price-asc" | "price-desc";

export function resolveWishlistDisplay(
  items: readonly WishlistItem[],
  catalog: readonly ShopProduct[] = [],
): WishlistDisplayItem[] {
  return items.map((item) => {
    const product = catalog.find((entry) => entry.slug === item.slug) ?? null;

    return {
      slug: item.slug,
      savedAt: item.savedAt,
      available: product !== null,
      product,
    };
  });
}

export function sortWishlistDisplay(
  items: readonly WishlistDisplayItem[],
  sortId: WishlistSortId,
): WishlistDisplayItem[] {
  const next = [...items];

  switch (sortId) {
    case "price-asc":
      return next.sort((a, b) => {
        const priceA = a.product?.priceCents ?? Number.POSITIVE_INFINITY;
        const priceB = b.product?.priceCents ?? Number.POSITIVE_INFINITY;
        return priceA - priceB;
      });
    case "price-desc":
      return next.sort((a, b) => {
        const priceA = a.product?.priceCents ?? -1;
        const priceB = b.product?.priceCents ?? -1;
        return priceB - priceA;
      });
    case "recent":
    default:
      return next.sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      );
  }
}
