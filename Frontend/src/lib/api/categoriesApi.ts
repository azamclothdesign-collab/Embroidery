import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import { type CategoryRecord } from "@/types/api/product";

import "server-only";

type CategoriesListResponse = {
  categories: CategoryRecord[];
};

type CategoryResponse = {
  category: CategoryRecord;
};

export type CategoryMutationInput = {
  id: string;
  label: string;
  sortOrder: number;
  isVisible: boolean;
  imageSrc?: string | undefined;
  imageAlt?: string | undefined;
};

export async function fetchCategories(): Promise<CategoryRecord[]> {
  const data = await requestApiJsonWithContext<CategoriesListResponse>({
    method: "GET",
    path: apiRoutes.categories.list,
    cacheStrategy: { next: { revalidate: 300 } },
    context: {},
  });

  return data.categories;
}

export async function fetchCategoriesFresh(): Promise<CategoryRecord[]> {
  const data = await requestApiJsonWithContext<CategoriesListResponse>({
    method: "GET",
    path: apiRoutes.categories.list,
    cacheStrategy: { cache: "no-store" },
  });

  return data.categories;
}

export async function createCategory(
  input: CategoryMutationInput,
): Promise<CategoryRecord> {
  const data = await requestApiJsonWithContext<CategoryResponse>({
    method: "POST",
    path: apiRoutes.categories.create,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });

  return data.category;
}

export async function updateCategory(
  id: string,
  input: Omit<CategoryMutationInput, "id">,
): Promise<CategoryRecord> {
  const data = await requestApiJsonWithContext<CategoryResponse>({
    method: "PUT",
    path: apiRoutes.categories.update(id),
    body: input,
    cacheStrategy: { cache: "no-store" },
  });

  return data.category;
}

export async function deleteCategory(id: string): Promise<{ ok: true }> {
  return requestApiJsonWithContext<{ ok: true }>({
    method: "DELETE",
    path: apiRoutes.categories.delete(id),
    cacheStrategy: { cache: "no-store" },
  });
}
