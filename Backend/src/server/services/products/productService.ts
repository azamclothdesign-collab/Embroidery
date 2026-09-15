import {
  deleteProduct,
  findProductBySlug,
  insertProduct,
  listProducts,
  updateProduct,
} from "../../database/repositories/products/productRepository.js";
import { type ShopProduct } from "../../../types/product.js";
import { withOptionalFields } from "../../../utils/optionalFields.js";
import { ServiceError } from "../../../utils/serviceError.js";

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
  } catch {
    throw new ServiceError(409, "conflict", "Product already exists");
  }
}

export async function updateProductBySlug(
  slug: string,
  input: Omit<ShopProduct, "slug"> & { description?: string | undefined },
): Promise<ShopProduct> {
  const product = await updateProduct(slug, {
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
