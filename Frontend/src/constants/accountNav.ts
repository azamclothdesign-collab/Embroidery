export const accountNavItems = [
  { id: "overview", label: "Overview", href: "/account" },
  { id: "orders", label: "Orders", href: "/account/orders" },
  { id: "downloads", label: "Downloads", href: "/account/downloads" },
  { id: "saved", label: "Saved Designs", href: "/wishlist" },
  { id: "settings", label: "Account Settings", href: "/account/settings" },
] as const;

export type AccountNavId = (typeof accountNavItems)[number]["id"];

export const accountSettingsHref = "/account/settings";
export const accountOrdersHref = "/account/orders";
export const accountDownloadsHref = "/account/downloads";

export function orderDetailHref(orderId: string): string {
  return `/orders/${orderId}`;
}

export function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatPurchasedDesignCount(count: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(count);
  return count === 1
    ? `${formatted} Purchased Design`
    : `${formatted} Purchased Designs`;
}

export function formatCompletedOrderCount(count: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(count);
  return count === 1
    ? `${formatted} completed order`
    : `${formatted} completed orders`;
}
