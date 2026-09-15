"use client";

import { useSyncExternalStore } from "react";

import {
  notifyWishlistUpdated,
  wishlistUpdatedEventName,
} from "@/lib/session/wishlistSession";
import { getWishlistAction } from "@/server/actions/wishlistActions";
import { type WishlistItem, type WishlistView } from "@/types/api/wishlist";

type WishlistStoreSnapshot = {
  items: readonly WishlistItem[];
  version: number;
};

const emptySnapshot: WishlistStoreSnapshot = {
  items: [],
  version: 0,
};

let snapshot: WishlistStoreSnapshot = emptySnapshot;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function applyWishlistSnapshot(wishlist: WishlistView): void {
  snapshot = {
    items: wishlist.items,
    version: snapshot.version + 1,
  };
  emit();
}

async function refreshWishlistItems(): Promise<void> {
  try {
    const wishlist = await getWishlistAction();
    snapshot = {
      items: wishlist.items,
      version: snapshot.version + 1,
    };
    emit();
  } catch {
    snapshot = {
      items: [],
      version: snapshot.version + 1,
    };
    emit();
  }
}

function ensureRefresh(): void {
  if (fetchPromise === null) {
    fetchPromise = refreshWishlistItems().finally(() => {
      fetchPromise = null;
    });
  }
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  ensureRefresh();

  const onWishlistUpdate = () => {
    void refreshWishlistItems();
  };

  window.addEventListener(wishlistUpdatedEventName, onWishlistUpdate);
  window.addEventListener("storage", onWishlistUpdate);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener(wishlistUpdatedEventName, onWishlistUpdate);
    window.removeEventListener("storage", onWishlistUpdate);
  };
}

function getSnapshot(): WishlistStoreSnapshot {
  return snapshot;
}

function getServerSnapshot(): WishlistStoreSnapshot {
  return emptySnapshot;
}

export function useWishlistItems(): readonly WishlistItem[] {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return current.items;
}

export function useWishlistSaved(slug: string): boolean {
  const items = useWishlistItems();

  return items.some((item) => item.slug === slug);
}

export function triggerWishlistUpdated(): void {
  notifyWishlistUpdated();
}
