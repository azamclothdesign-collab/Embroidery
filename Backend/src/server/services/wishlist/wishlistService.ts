import {
  listWishlistItems,
  replaceWishlistItems,
} from "../../database/repositories/wishlist/wishlistRepository.js";
import { type WishlistView } from "../../../types/wishlist.js";
import { ServiceError } from "../../../utils/serviceError.js";

function requireCustomerId(customerId?: string): string {
  if (customerId === undefined) {
    throw new ServiceError(401, "unauthenticated", "Unauthorized");
  }

  return customerId;
}

export async function getWishlist(customerId?: string): Promise<WishlistView> {
  const id = requireCustomerId(customerId);
  const items = await listWishlistItems(id);
  return { items };
}

export async function updateWishlist(input: {
  customerId?: string | undefined;
  slugs: string[];
}): Promise<WishlistView> {
  const id = requireCustomerId(input.customerId);

  await replaceWishlistItems({
    customerId: id,
    slugs: input.slugs,
  });

  const items = await listWishlistItems(id);
  return { items };
}
