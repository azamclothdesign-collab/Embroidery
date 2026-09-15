export const adminNavItems = [
  { id: "overview", label: "Overview", href: "/admin" },
  { id: "products", label: "Products", href: "/admin/products" },
  { id: "categories", label: "Categories", href: "/admin/categories" },
  { id: "orders", label: "Orders", href: "/admin/orders" },
  { id: "site", label: "Dynamic Site", href: "/admin/site" },
  { id: "settings", label: "Settings", href: "/admin/settings" },
  { id: "security", label: "Security", href: "/admin/security" },
] as const;

export type AdminNavId = (typeof adminNavItems)[number]["id"];

export const adminVersionLabel = "v1.0.0";

export const adminLoginHref = "/admin/login";
export const adminProductNewHref = "/admin/products/new";
export const adminSiteHomeHref = "/admin/site/home";
export const adminSitePagesHref = "/admin/site/pages";
export const adminSiteFaqsHref = "/admin/site/faqs";
export const adminSiteGlobalHref = "/admin/site/global";

export function adminProductEditHref(
  slug: string,
  options?: { section?: "files" },
): string {
  const base = `/admin/products/${slug}`;

  if (options?.section === "files") {
    return `${base}?section=files`;
  }

  return base;
}

export function adminOrderDetailHref(orderId: string): string {
  return `/admin/orders/${orderId}`;
}

export function isAdminNavCurrent(
  pathname: string,
  localeRoot: string,
  itemHref: string,
): boolean {
  const href = `${localeRoot}${itemHref}`;

  if (itemHref === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
