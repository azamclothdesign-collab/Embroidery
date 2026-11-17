"use client";

import { useEffect, useState, useTransition } from "react";
import { quoteAction } from "@/actions/store";
import { useCart } from "@/features/cart/CartProvider";
import type { Quote } from "@/lib/types";

/**
 * Asks the server for real prices whenever the cart or coupon changes.
 * Designs the server no longer sells are dropped from the cart.
 */
export function useQuote(couponCode: string | null) {
  const cart = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [pending, startTransition] = useTransition();
  const slugs = cart.items.map((item) => item.slug).join(",");

  useEffect(() => {
    if (!cart.ready || slugs.length === 0) return;
    let cancelled = false;
    startTransition(async () => {
      const result = await quoteAction(slugs.split(","), couponCode);
      if (cancelled) return;
      if (result.ok) {
        setQuote(result);
        setError(null);
      } else if (result.code === "items_unavailable" && result.fields?.items) {
        cart.removeMany(result.fields.items.split(","));
        setRemoved(true);
      } else {
        setError(result.message);
      }
    });
    return () => {
      cancelled = true;
    };
    // cart.removeMany is stable; re-run only when the cart contents or coupon change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.ready, slugs, couponCode]);

  return { quote: slugs.length === 0 ? null : quote, error, removed, pending };
}
