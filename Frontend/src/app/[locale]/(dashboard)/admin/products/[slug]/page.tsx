import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminProductEditor } from "@/features/admin/products/AdminProductEditor";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchProductBySlug } from "@/lib/api/productsApi";
import { type CategoryRecord, type ShopProduct } from "@/types/api/product";

type RouteProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ section?: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.productsEditorTitle} | Admin`,
};

export default async function AdminProductEditRoute({
  params,
  searchParams,
}: RouteProps) {
  const { locale, slug } = await params;
  const { section } = await searchParams;

  let product: ShopProduct | undefined;
  let categories: CategoryRecord[];

  try {
    product = await fetchProductBySlug(slug);
  } catch {
    product = undefined;
  }

  try {
    categories = await fetchCategories();
  } catch {
    categories = [];
  }

  return (
    <AdminProductEditor
      locale={locale}
      mode="edit"
      product={product}
      categories={categories}
      initialSection={section}
    />
  );
}
