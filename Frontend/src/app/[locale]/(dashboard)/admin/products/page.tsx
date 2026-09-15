import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminProductsPage } from "@/features/admin/products/AdminProductsPage";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchProductsFresh } from "@/lib/api/productsApi";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.productsTitle} | Admin`,
  description: adminCopy.productsBody,
};

export default async function AdminProductsRoute({ params }: RouteProps) {
  const { locale } = await params;
  const [products, categories] = await Promise.all([
    fetchProductsFresh(),
    fetchCategories().catch(() => []),
  ]);

  return (
    <AdminProductsPage
      locale={locale}
      products={products}
      categories={categories}
    />
  );
}
