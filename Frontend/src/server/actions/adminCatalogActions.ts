"use server";

import { revalidatePath } from "next/cache";

import { locales } from "@/constants/locales";
import { ApiClientError } from "@/lib/api/apiClient";
import {
  type CategoryMutationInput,
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/api/categoriesApi";
import { uploadAdminMedia, uploadAdminPackage } from "@/lib/api/mediaApi";
import { downloadOrderPackage } from "@/lib/api/ordersApi";
import {
  createProduct,
  deleteProduct,
  type ProductMutationInput,
  updateProduct,
} from "@/lib/api/productsApi";
import {
  updateSiteFaqs,
  updateSiteGlobal,
  updateSiteHome,
  updateSitePages,
} from "@/lib/api/siteSettingsApi";
import { type CategoryRecord, type ShopProduct } from "@/types/api/product";
import {
  type SiteFaqsSettings,
  type SiteGlobalSettings,
  type SiteHomeSettings,
  type SitePagesSettings,
} from "@/types/api/siteSettings";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toError(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (
      (error.code === "validation_error" || error.code === "conflict") &&
      error.message.trim().length > 0
    ) {
      return error.message;
    }

    return error.code;
  }

  return "failed";
}

function revalidateProductCatalog(slug?: string | undefined): void {
  revalidatePath("/", "layout");

  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/designs`);
    revalidatePath(`/${locale}/new-arrivals`);
    revalidatePath(`/${locale}/categories`);
    revalidatePath(`/${locale}/admin/products`);
    revalidatePath(`/${locale}/admin/categories`);

    if (slug !== undefined && slug.trim().length > 0) {
      revalidatePath(`/${locale}/designs/${slug}`);
      revalidatePath(`/${locale}/admin/products/${slug}`);
    }
  }
}

function revalidateCategoryCatalog(): void {
  revalidatePath("/", "layout");

  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/categories`);
    revalidatePath(`/${locale}/designs`);
    revalidatePath(`/${locale}/admin/categories`);
  }
}

function resolveImageContentType(
  file: File,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  ) {
    return file.type;
  }

  const name = file.name.toLowerCase();

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (name.endsWith(".png")) {
    return "image/png";
  }

  if (name.endsWith(".webp")) {
    return "image/webp";
  }

  return null;
}

export async function uploadAdminImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  try {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { ok: false, error: "validation_error" };
    }

    const contentType = resolveImageContentType(file);

    if (contentType === null) {
      return { ok: false, error: "validation_error" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const media = await uploadAdminMedia({
      fileName: file.name,
      contentType,
      contentBase64: buffer.toString("base64"),
    });

    return { ok: true, data: { url: media.url } };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function uploadAdminPackageAction(
  formData: FormData,
): Promise<
  ActionResult<{ packagePath: string; packageFileName: string }>
> {
  try {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { ok: false, error: "validation_error" };
    }

    const isZip =
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed" ||
      file.name.toLowerCase().endsWith(".zip");

    if (!isZip) {
      return { ok: false, error: "validation_error" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const media = await uploadAdminPackage({
      fileName: file.name,
      contentType: "application/zip",
      contentBase64: buffer.toString("base64"),
    });

    return {
      ok: true,
      data: {
        packagePath: media.packagePath,
        packageFileName: media.packageFileName,
      },
    };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function downloadOrderPackageAction(input: {
  orderId: string;
  productSlug: string;
}): Promise<
  ActionResult<{
    fileName: string;
    contentType: string;
    contentBase64: string;
  }>
> {
  try {
    const file = await downloadOrderPackage(input);
    return {
      ok: true,
      data: {
        fileName: file.fileName,
        contentType: file.contentType,
        contentBase64: file.contentBase64,
      },
    };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function createCategoryAction(
  input: CategoryMutationInput,
): Promise<ActionResult<CategoryRecord>> {
  try {
    const category = await createCategory({
      id: input.id,
      label: input.label,
      sortOrder: input.sortOrder,
      isVisible: input.isVisible,
      imageSrc: input.imageSrc,
      imageAlt: input.imageAlt,
    });
    revalidateCategoryCatalog();
    return { ok: true, data: category };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function updateCategoryAction(
  input: CategoryMutationInput,
): Promise<ActionResult<CategoryRecord>> {
  try {
    const category = await updateCategory(input.id, {
      label: input.label,
      sortOrder: input.sortOrder,
      isVisible: input.isVisible,
      imageSrc: input.imageSrc,
      imageAlt: input.imageAlt,
    });
    revalidateCategoryCatalog();
    return { ok: true, data: category };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function deleteCategoryAction(
  id: string,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const result = await deleteCategory(id);
    revalidateCategoryCatalog();
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function createProductAction(
  input: ProductMutationInput,
): Promise<ActionResult<ShopProduct>> {
  try {
    const product = await createProduct(input);
    revalidateProductCatalog(product.slug);
    return { ok: true, data: product };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function updateProductAction(
  slug: string,
  input: ProductMutationInput,
): Promise<ActionResult<ShopProduct>> {
  try {
    const product = await updateProduct(slug, input);
    revalidateProductCatalog(product.slug);
    return { ok: true, data: product };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function deleteProductAction(
  slug: string,
): Promise<ActionResult<{ ok: true }>> {
  try {
    const result = await deleteProduct(slug);
    revalidateProductCatalog(slug);
    return { ok: true, data: result };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function updateSiteGlobalAction(
  settings: SiteGlobalSettings,
): Promise<ActionResult<SiteGlobalSettings>> {
  try {
    const next = await updateSiteGlobal(settings);
    return { ok: true, data: next };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function updateSiteHomeAction(
  settings: SiteHomeSettings,
): Promise<ActionResult<SiteHomeSettings>> {
  try {
    const next = await updateSiteHome(settings);
    return { ok: true, data: next };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function updateSiteFaqsAction(
  settings: SiteFaqsSettings,
): Promise<ActionResult<SiteFaqsSettings>> {
  try {
    const next = await updateSiteFaqs(settings);
    return { ok: true, data: next };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}

export async function updateSitePagesAction(
  settings: SitePagesSettings,
): Promise<ActionResult<SitePagesSettings>> {
  try {
    const next = await updateSitePages(settings);
    return { ok: true, data: next };
  } catch (error) {
    return { ok: false, error: toError(error) };
  }
}
