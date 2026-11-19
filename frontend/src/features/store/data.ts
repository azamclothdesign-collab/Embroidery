import "server-only";
import { cache } from "react";
import { api, apiOrNull } from "@/lib/api.server";
import type { Category, CmsPage, Product, ProductPage, PublicMethod, Storefront } from "@/lib/types";

/** Per-request memoized reads (layout + page + metadata share one fetch). */
export const getStorefront = cache(() => api<Storefront>("/v1/storefront"));

export const getCategories = cache(async () => (await api<{ items: Category[] }>("/v1/categories")).items);

export const getCategory = cache((slug: string) => apiOrNull<Category>(`/v1/categories/${encodeURIComponent(slug)}`));

export const getProduct = cache((slug: string) =>
  apiOrNull<{ product: Product; related: Product[] }>(`/v1/products/${encodeURIComponent(slug)}`),
);

export const getPage = cache((slug: string) => apiOrNull<CmsPage>(`/v1/pages/${encodeURIComponent(slug)}`));

export const getMethods = cache(async () => (await api<{ items: PublicMethod[] }>("/v1/payment-methods")).items);

export type ProductQuery = {
  category?: string;
  q?: string;
  format?: string;
  onSale?: boolean;
  featured?: boolean;
  sort?: "new" | "price_asc" | "price_desc" | "name";
  page?: number;
  limit?: number;
};

const fetchProducts = cache((qs: string) => api<ProductPage>(`/v1/products?${qs}`));

export function getProducts(query: ProductQuery): Promise<ProductPage> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.q) params.set("q", query.q);
  if (query.format) params.set("format", query.format);
  if (query.onSale === true) params.set("onSale", "1");
  if (query.featured === true) params.set("featured", "1");
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  params.sort();
  return fetchProducts(params.toString());
}

export const SORTS = ["new", "price_asc", "price_desc", "name"] as const;
export const FORMATS = ["DST", "EMB"] as const;

/** Reads list filters from searchParams, ignoring anything invalid. */
export function readListParams(params: Record<string, string | string[] | undefined>): ProductQuery {
  const one = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };
  const sort = one("sort");
  const format = one("format")?.toUpperCase();
  const page = Number.parseInt(one("page") ?? "1", 10);
  const q = one("q")?.trim().slice(0, 80);
  return {
    sort: (SORTS as readonly string[]).includes(sort ?? "") ? (sort as NonNullable<ProductQuery["sort"]>) : "new",
    ...(format !== undefined && (FORMATS as readonly string[]).includes(format) ? { format } : {}),
    ...(one("sale") === "1" ? { onSale: true } : {}),
    ...(q !== undefined && q.length > 0 ? { q } : {}),
    page: Number.isFinite(page) && page > 0 && page <= 200 ? page : 1,
  };
}
