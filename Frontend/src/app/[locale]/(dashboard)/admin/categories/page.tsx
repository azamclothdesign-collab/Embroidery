import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminCategoriesPage } from "@/features/admin/categories/AdminCategoriesPage";
import { fetchCategoriesFresh } from "@/lib/api/categoriesApi";
import { type CategoryRecord } from "@/types/api/product";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.categoriesTitle} | Admin`,
  description: adminCopy.categoriesBody,
};

export default async function AdminCategoriesRoute({ params }: RouteProps) {
  const { locale } = await params;

  let categories: CategoryRecord[];

  try {
    categories = await fetchCategoriesFresh();
  } catch {
    categories = [];
  }

  return <AdminCategoriesPage locale={locale} categories={categories} />;
}
