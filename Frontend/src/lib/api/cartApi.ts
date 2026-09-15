import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import { type CartLine, type CartView } from "@/types/api/cart";

import "server-only";

export async function fetchCart(): Promise<CartView> {
  return requestApiJsonWithContext<CartView>({
    method: "GET",
    path: apiRoutes.cart.get,
    cacheStrategy: { cache: "no-store" },
  });
}

export async function updateCart(lines: readonly CartLine[]): Promise<CartView> {
  return requestApiJsonWithContext<CartView>({
    method: "PUT",
    path: apiRoutes.cart.update,
    body: { lines },
    cacheStrategy: { cache: "no-store" },
  });
}
