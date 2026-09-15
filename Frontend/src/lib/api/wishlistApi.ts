import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import { type WishlistView } from "@/types/api/wishlist";

import "server-only";

export async function fetchWishlist(): Promise<WishlistView> {
  return requestApiJsonWithContext<WishlistView>({
    method: "GET",
    path: apiRoutes.wishlist.get,
    cacheStrategy: { cache: "no-store" },
  });
}

export async function updateWishlist(slugs: readonly string[]): Promise<WishlistView> {
  return requestApiJsonWithContext<WishlistView>({
    method: "PUT",
    path: apiRoutes.wishlist.update,
    body: { slugs },
    cacheStrategy: { cache: "no-store" },
  });
}
