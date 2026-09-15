import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminProductEditor } from "@/features/admin/products/AdminProductEditor";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { type CategoryRecord } from "@/types/api/product";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.productsCreateTitle} | Admin`,
};

export default async function AdminProductNewRoute({ params }: RouteProps) {
  const { locale } = await params;

  let categories: CategoryRecord[];

  try {
    categories = await fetchCategories();
  } catch {
    categories = [];
  }

  return (
    <AdminProductEditor locale={locale} mode="create" categories={categories} />
  );
}
