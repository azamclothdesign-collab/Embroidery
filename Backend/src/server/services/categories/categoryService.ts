import {
  deleteCategory,
  findCategoryById,
  insertCategory,
  listCategories,
  updateCategory,
} from "../../database/repositories/categories/categoryRepository.js";
import { type CategoryRecord } from "../../../types/product.js";
import { ServiceError } from "../../../utils/serviceError.js";

export async function getCategories(): Promise<CategoryRecord[]> {
  return listCategories();
}

export async function createCategory(
  input: CategoryRecord,
): Promise<CategoryRecord> {
  try {
    return await insertCategory(input);
  } catch {
    throw new ServiceError(409, "conflict", "Category already exists");
  }
}

export async function updateCategoryById(
  id: string,
  input: Omit<CategoryRecord, "id">,
): Promise<CategoryRecord> {
  const category = await updateCategory(id, input);

  if (category === null) {
    throw new ServiceError(404, "not_found", "Category not found");
  }

  return category;
}

export async function deleteCategoryById(id: string): Promise<{ ok: true }> {
  const deleted = await deleteCategory(id);

  if (!deleted) {
    throw new ServiceError(404, "not_found", "Category not found");
  }

  return { ok: true };
}

export async function requireCategory(id: string): Promise<CategoryRecord> {
  const category = await findCategoryById(id);

  if (category === null) {
    throw new ServiceError(404, "not_found", "Category not found");
  }

  return category;
}
