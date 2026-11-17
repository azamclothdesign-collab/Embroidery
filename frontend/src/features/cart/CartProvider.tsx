"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * The cart only remembers WHICH designs were chosen (plus a display snapshot).
 * Prices are always re-quoted by the server at checkout.
 */
export type CartItem = {
  slug: string;
  name: string;
  image: string | null;
  priceMinor: number;
  salePriceMinor: number | null;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (item: CartItem) => void;
  remove: (slug: string) => void;
  removeMany: (slugs: string[]) => void;
  clear: () => void;
  has: (slug: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "emb_cart_v1";
const MAX_ITEMS = 50;

function load(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is CartItem =>
          typeof item === "object" && item !== null && typeof (item as CartItem).slug === "string" && typeof (item as CartItem).priceMinor === "number",
      )
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function save(items: CartItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode / storage full: the cart still works for this tab.
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setItems(load());
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setItems(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((next: (current: CartItem[]) => CartItem[]) => {
    setItems((current) => {
      const value = next(current);
      save(value);
      return value;
    });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ready,
      open,
      setOpen,
      add: (item) => update((current) => (current.some((c) => c.slug === item.slug) ? current : [...current, item].slice(0, MAX_ITEMS))),
      remove: (slug) => update((current) => current.filter((item) => item.slug !== slug)),
      removeMany: (slugs) => update((current) => current.filter((item) => !slugs.includes(item.slug))),
      clear: () => update(() => []),
      has: (slug) => items.some((item) => item.slug === slug),
    }),
    [items, ready, open, update],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (context === null) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.salePriceMinor ?? item.priceMinor), 0);
}
