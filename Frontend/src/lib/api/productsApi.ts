import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import { type ShopProduct } from "@/types/api/product";

import "server-only";

type ProductsListResponse = {
  products: ShopProduct[];
};

type ProductDetailsResponse = {
  product: ShopProduct;
};

export type ProductMutationInput = {
  slug: string;
  pdpSlug: string;
  name: string;
  categoryId: string;
  rating: number;
  formats: string[];
  priceCents: number;
  hoopSize: string;
  stitchCount: number;
  badge: string;
  imageSrc: string;
  imageAlt: string;
  stitchedImageSrc?: string | undefined;
  stitchedImageAlt?: string | undefined;
  description?: string | undefined;
  packagePath?: string | undefined;
  packageFileName?: string | undefined;
  isVisible?: boolean | undefined;
};

/** Public storefront catalog — never forwards admin session cookies. */
export async function fetchProducts(): Promise<ShopProduct[]> {
  const data = await requestApiJsonWithContext<ProductsListResponse>({
    method: "GET",
    path: apiRoutes.products.list,
    cacheStrategy: { next: { revalidate: 60 } },
    context: {},
  });

  return data.products.filter((product) => product.isVisible !== false);
}

/** Admin catalog — includes unpublished products when an admin session exists. */
export async function fetchProductsFresh(): Promise<ShopProduct[]> {
  const data = await requestApiJsonWithContext<ProductsListResponse>({
    method: "GET",
    path: apiRoutes.products.list,
    cacheStrategy: { cache: "no-store" },
  });

  return data.products;
}

export const getShopProducts = fetchProducts;

/** Product details — admin session allows Preview of unpublished; shoppers still get 404. */
export async function fetchProductBySlug(slug: string): Promise<ShopProduct> {
  const data = await requestApiJsonWithContext<ProductDetailsResponse>({
    method: "GET",
    path: apiRoutes.products.details(slug),
    cacheStrategy: { next: { revalidate: 60 } },
  });

  return data.product;
}

/** Admin editor — can load unpublished products with an admin session. */
export async function fetchProductBySlugFresh(
  slug: string,
): Promise<ShopProduct> {
  const data = await requestApiJsonWithContext<ProductDetailsResponse>({
    method: "GET",
    path: apiRoutes.products.details(slug),
    cacheStrategy: { cache: "no-store" },
  });

  return data.product;
}

export async function createProduct(
  input: ProductMutationInput,
): Promise<ShopProduct> {
  const data = await requestApiJsonWithContext<ProductDetailsResponse>({
    method: "POST",
    path: apiRoutes.products.create,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });

  return data.product;
}

export async function updateProduct(
  slug: string,
  input: ProductMutationInput,
): Promise<ShopProduct> {
  const { slug: _slug, ...body } = input;
  const data = await requestApiJsonWithContext<ProductDetailsResponse>({
    method: "PUT",
    path: apiRoutes.products.update(slug),
    body,
    cacheStrategy: { cache: "no-store" },
  });

  return data.product;
}

export async function deleteProduct(slug: string): Promise<{ ok: true }> {
  return requestApiJsonWithContext<{ ok: true }>({
    method: "DELETE",
    path: apiRoutes.products.delete(slug),
    cacheStrategy: { cache: "no-store" },
  });
}
