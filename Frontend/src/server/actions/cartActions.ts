"use server";

import { ApiClientError } from "@/lib/api/apiClient";
import { fetchCart, updateCart } from "@/lib/api/cartApi";
import { ensureGuestTokenCookie } from "@/server/session/cookies";
import { type CartLine, type CartView } from "@/types/api/cart";

export async function ensureGuestTokenAction(): Promise<string> {
  return ensureGuestTokenCookie();
}

export async function getCartAction(): Promise<CartView> {
  try {
    await ensureGuestTokenCookie();
    return await fetchCart();
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return { lines: [] };
    }

    return { lines: [] };
  }
}

export async function updateCartAction(
  lines: readonly CartLine[],
): Promise<CartView> {
  await ensureGuestTokenCookie();
  return updateCart(lines);
}

export async function addCartLineAction(line: CartLine): Promise<CartView> {
  const cart = await getCartAction();
  const exists = cart.lines.some((item) => item.slug === line.slug);
  const next = exists ? cart.lines : [...cart.lines, line];
  return updateCartAction(next);
}

export async function removeCartLineAction(slug: string): Promise<CartView> {
  const cart = await getCartAction();
  return updateCartAction(cart.lines.filter((item) => item.slug !== slug));
}

export async function clearCartAction(): Promise<CartView> {
  return updateCartAction([]);
}
