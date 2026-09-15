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

export async function fetchProducts(): Promise<ShopProduct[]> {
  const data = await requestApiJsonWithContext<ProductsListResponse>({
    method: "GET",
    path: apiRoutes.products.list,
    cacheStrategy: { next: { revalidate: 60 } },
  });

  return data.products;
}

export async function fetchProductsFresh(): Promise<ShopProduct[]> {
  const data = await requestApiJsonWithContext<ProductsListResponse>({
    method: "GET",
    path: apiRoutes.products.list,
    cacheStrategy: { cache: "no-store" },
  });

  return data.products;
}

export const getShopProducts = fetchProducts;

export async function fetchProductBySlug(slug: string): Promise<ShopProduct> {
  const data = await requestApiJsonWithContext<ProductDetailsResponse>({
    method: "GET",
    path: apiRoutes.products.details(slug),
    cacheStrategy: { next: { revalidate: 60 } },
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
