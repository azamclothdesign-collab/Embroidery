"use server";

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
    if (error.code === "validation_error" && error.message.trim().length > 0) {
      return error.message;
    }

    return error.code;
  }

  return "failed";
}

export async function uploadAdminImageAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  try {
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return { ok: false, error: "validation_error" };
    }

    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/webp"
    ) {
      return { ok: false, error: "validation_error" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const media = await uploadAdminMedia({
      fileName: file.name,
      contentType: file.type,
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
