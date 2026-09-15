export type { CartLine } from "@/types/api/cart";

export const cartUpdatedEventName = "embroidery-cart-updated";
export const cartAddedEventName = "embroidery-cart-added";

export type CartAddedDetail = {
  openDrawer?: boolean;
};

export function notifyCartAdded(detail?: CartAddedDetail): void {
  window.dispatchEvent(new CustomEvent(cartAddedEventName, { detail }));
}

export function notifyCartUpdated(): void {
  window.dispatchEvent(new Event(cartUpdatedEventName));
}

export function cartSubtotalCents(
  lines: readonly { priceCents: number }[],
): number {
  return lines.reduce((sum, line) => sum + line.priceCents, 0);
}
