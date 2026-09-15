"use server";

import {
  getCustomerSession,
} from "@/lib/api/authApi";
import { fetchWishlist, updateWishlist } from "@/lib/api/wishlistApi";
import {
  readGuestWishlistSlugs,
  writeGuestWishlistSlugs,
} from "@/server/session/cookies";
import { type WishlistItem, type WishlistView } from "@/types/api/wishlist";

function guestItemsFromSlugs(slugs: readonly string[]): WishlistItem[] {
  const now = new Date().toISOString();

  return slugs.map((slug) => ({
    slug,
    savedAt: now,
  }));
}

async function isCustomerAuthenticated(): Promise<boolean> {
  try {
    const session = await getCustomerSession();
    return session !== null;
  } catch {
    return false;
  }
}

export async function getWishlistAction(): Promise<WishlistView> {
  const authenticated = await isCustomerAuthenticated();

  if (authenticated) {
    try {
      return await fetchWishlist();
    } catch {
      const slugs = await readGuestWishlistSlugs();
      return { items: guestItemsFromSlugs(slugs) };
    }
  }

  const slugs = await readGuestWishlistSlugs();
  return { items: guestItemsFromSlugs(slugs) };
}

export async function updateWishlistSlugsAction(
  slugs: readonly string[],
): Promise<WishlistView> {
  const authenticated = await isCustomerAuthenticated();

  if (authenticated) {
    try {
      return await updateWishlist(slugs);
    } catch {
      await writeGuestWishlistSlugs(slugs);
      return { items: guestItemsFromSlugs(slugs) };
    }
  }

  await writeGuestWishlistSlugs(slugs);
  return { items: guestItemsFromSlugs(slugs) };
}

export async function addWishlistItemAction(slug: string): Promise<WishlistView> {
  const current = await getWishlistAction();

  if (current.items.some((item) => item.slug === slug)) {
    return current;
  }

  return updateWishlistSlugsAction([slug, ...current.items.map((item) => item.slug)]);
}

export async function removeWishlistItemAction(slug: string): Promise<WishlistView> {
  const current = await getWishlistAction();
  return updateWishlistSlugsAction(
    current.items.filter((item) => item.slug !== slug).map((item) => item.slug),
  );
}

export async function toggleWishlistItemAction(slug: string): Promise<{
  saved: boolean;
  wishlist: WishlistView;
}> {
  const current = await getWishlistAction();
  const exists = current.items.some((item) => item.slug === slug);

  if (exists) {
    const wishlist = await removeWishlistItemAction(slug);
    return { saved: false, wishlist };
  }

  const wishlist = await addWishlistItemAction(slug);
  return { saved: true, wishlist };
}

export async function restoreWishlistItemAction(
  item: WishlistItem,
): Promise<WishlistView> {
  const current = await getWishlistAction();

  if (current.items.some((entry) => entry.slug === item.slug)) {
    return current;
  }

  return updateWishlistSlugsAction([
    item.slug,
    ...current.items.map((entry) => entry.slug),
  ]);
}
