export type { WishlistItem } from "@/types/api/wishlist";

export const wishlistUpdatedEventName = "embroidery-wishlist-updated";

export function notifyWishlistUpdated(): void {
  window.dispatchEvent(new Event(wishlistUpdatedEventName));
}
