import { type Metadata } from "next";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { categoriesHubCopy } from "@/constants/categoriesHubCopy";
import { CategoriesHubPage } from "@/features/categories/CategoriesHubPage";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchProducts } from "@/lib/api/productsApi";
import { buildCategoryStorefrontTiles } from "@/lib/catalog/buildCategoryStorefrontTiles";

type CategoriesRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: categoriesHubCopy.metaTitle,
  description: categoriesHubCopy.metaDescription,
};

export default async function CategoriesRoute({ params }: CategoriesRouteProps) {
  const { locale } = await params;
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories().catch(() => []),
  ]);
  const tiles = buildCategoryStorefrontTiles(categories);

  return (
    <>
      <SiteHeader />
      <PageEnter>
        <CategoriesHubPage locale={locale} products={products} tiles={tiles} />
      </PageEnter>
    </>
  );
}
