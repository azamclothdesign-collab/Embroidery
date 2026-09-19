import {
  deleteProduct,
  findProductByName,
  findProductBySlug,
  insertProduct,
  listProducts,
  updateProduct,
} from "../../database/repositories/products/productRepository.js";
import { type ShopProduct } from "../../../types/product.js";
import { withOptionalFields } from "../../../utils/optionalFields.js";
import { ServiceError } from "../../../utils/serviceError.js";

function isPostgresUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}

function uniqueViolationMessage(error: unknown): string {
  const constraint =
    typeof error === "object" &&
    error !== null &&
    "constraint" in error &&
    typeof (error as { constraint: unknown }).constraint === "string"
      ? (error as { constraint: string }).constraint
      : "";

  if (constraint.includes("name")) {
    return "A product with this name already exists";
  }

  return "Product already exists";
}

async function assertUniqueProductName(
  name: string,
  excludeSlug?: string | undefined,
): Promise<void> {
  const existing = await findProductByName(name, excludeSlug);

  if (existing !== null) {
    throw new ServiceError(
      409,
      "conflict",
      "A product with this name already exists",
    );
  }
}

export async function getProducts(): Promise<ShopProduct[]> {
  return listProducts();
}

export async function getProductBySlug(slug: string): Promise<ShopProduct> {
  const product = await findProductBySlug(slug);

  if (product === null) {
    throw new ServiceError(404, "not_found", "Product not found");
  }

  return product;
}

export async function createProduct(
  input: ShopProduct & { description?: string | undefined },
): Promise<ShopProduct> {
  await assertUniqueProductName(input.name);

  try {
    return await insertProduct({
      slug: input.slug,
      pdpSlug: input.pdpSlug,
      name: input.name,
      categoryId: input.categoryId,
      rating: input.rating,
      priceCents: input.priceCents,
      hoopSize: input.hoopSize,
      stitchCount: input.stitchCount,
      badge: input.badge,
      imageSrc: input.imageSrc,
      imageAlt: input.imageAlt,
      formats: [...input.formats],
      ...withOptionalFields({
        stitchedImageSrc: input.stitchedImageSrc,
        stitchedImageAlt: input.stitchedImageAlt,
        description: input.description,
        packagePath: input.packagePath,
        packageFileName: input.packageFileName,
        isVisible: input.isVisible,
      }),
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    if (isPostgresUniqueViolation(error)) {
      throw new ServiceError(409, "conflict", uniqueViolationMessage(error));
    }

    throw new ServiceError(409, "conflict", "Product already exists");
  }
}

export async function updateProductBySlug(
  slug: string,
  input: Omit<ShopProduct, "slug"> & { description?: string | undefined },
): Promise<ShopProduct> {
  await assertUniqueProductName(input.name, slug);

  let product: ShopProduct | null;

  try {
    product = await updateProduct(slug, {
      pdpSlug: input.pdpSlug,
      name: input.name,
      categoryId: input.categoryId,
      rating: input.rating,
      priceCents: input.priceCents,
      hoopSize: input.hoopSize,
      stitchCount: input.stitchCount,
      badge: input.badge,
      imageSrc: input.imageSrc,
      imageAlt: input.imageAlt,
      formats: [...input.formats],
      ...withOptionalFields({
        stitchedImageSrc: input.stitchedImageSrc,
        stitchedImageAlt: input.stitchedImageAlt,
        description: input.description,
        packagePath: input.packagePath,
        packageFileName: input.packageFileName,
        isVisible: input.isVisible,
      }),
    });
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    if (isPostgresUniqueViolation(error)) {
      throw new ServiceError(409, "conflict", uniqueViolationMessage(error));
    }

    throw error;
  }

  if (product === null) {
    throw new ServiceError(404, "not_found", "Product not found");
  }

  return product;
}

export async function deleteProductBySlug(slug: string): Promise<{ ok: true }> {
  const deleted = await deleteProduct(slug);

  if (!deleted) {
    throw new ServiceError(404, "not_found", "Product not found");
  }

  return { ok: true };
}
