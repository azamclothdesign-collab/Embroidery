"use client";

import { useSyncExternalStore } from "react";

import {
  cartUpdatedEventName,
  notifyCartUpdated,
} from "@/lib/session/cartSession";
import { getCartAction } from "@/server/actions/cartActions";
import { type CartLine } from "@/types/api/cart";

type CartStoreSnapshot = {
  lines: readonly CartLine[];
  isReady: boolean;
  version: number;
};

const emptySnapshot: CartStoreSnapshot = {
  lines: [],
  isReady: false,
  version: 0,
};

let snapshot: CartStoreSnapshot = emptySnapshot;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

async function refreshCartLines(): Promise<void> {
  try {
    const cart = await getCartAction();
    snapshot = {
      lines: cart.lines,
      isReady: true,
      version: snapshot.version + 1,
    };
    emit();
  } catch {
    snapshot = {
      lines: [],
      isReady: true,
      version: snapshot.version + 1,
    };
    emit();
  }
}

function ensureRefresh(): void {
  if (fetchPromise === null) {
    fetchPromise = refreshCartLines().finally(() => {
      fetchPromise = null;
    });
  }
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  ensureRefresh();

  const onCartUpdate = () => {
    void refreshCartLines();
  };

  window.addEventListener(cartUpdatedEventName, onCartUpdate);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener(cartUpdatedEventName, onCartUpdate);
  };
}

function getSnapshot(): CartStoreSnapshot {
  return snapshot;
}

function getServerSnapshot(): CartStoreSnapshot {
  return emptySnapshot;
}

export function useCartLines(): readonly CartLine[] {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return current.lines;
}

export function useCartLinesReady(): boolean {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return current.isReady;
}

export function triggerCartUpdated(): void {
  notifyCartUpdated();
}
