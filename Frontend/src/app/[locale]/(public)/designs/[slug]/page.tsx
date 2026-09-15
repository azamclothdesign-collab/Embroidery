import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getCategoryPageContent,
  isCategoryLandingId,
} from "@/constants/categoryPageCopy";
import { ProductPage } from "@/features/product/ProductPage";
import { CategoryPage } from "@/features/shop/CategoryPage";
import { parseShopCatalogSearchParams } from "@/features/shop/shopCatalogQuery";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchProductBySlug, fetchProducts } from "@/lib/api/productsApi";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseSlug(slug: string): string | null {
  if (slug.length < 1 || slug.length > 120 || !slugPattern.test(slug)) {
    return null;
  }

  return slug;
}

type DesignSlugPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: DesignSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);

  if (parsed === null) {
    return {};
  }

  try {
    const product = await fetchProductBySlug(parsed);

    return {
      title: `${product.name} Embroidery Design`,
      description: product.imageAlt,
    };
  } catch {
    if (isCategoryLandingId(parsed)) {
      const content = getCategoryPageContent(parsed);
      return {
        title: `${content.heading} | Embroidery Collection`,
        description: content.body,
      };
    }

    return {};
  }
}

export default async function DesignSlugPage({
  params,
  searchParams,
}: DesignSlugPageProps) {
  const { locale, slug } = await params;
  const parsed = parseSlug(slug);

  if (parsed === null) {
    notFound();
  }

  let product: Awaited<ReturnType<typeof fetchProductBySlug>> | null = null;

  try {
    product = await fetchProductBySlug(parsed);
  } catch {
    product = null;
  }

  if (product !== null) {
    return <ProductPage locale={locale} product={product} />;
  }

  const categories = await fetchCategories().catch(() => []);
  const categoryMatch = categories.find(
    (category) => category.id === parsed && category.isVisible,
  );

  if (categoryMatch !== undefined || isCategoryLandingId(parsed)) {
    const raw = await searchParams;
    const initialProducts = await fetchProducts();
    const catalog = parseShopCatalogSearchParams(raw, { categoryId: parsed });

    return (
      <>
        <SiteHeader locale={locale} />
        <PageEnter>
          <CategoryPage
            locale={locale}
            categoryId={parsed}
            catalog={catalog}
            products={initialProducts}
          />
        </PageEnter>
      </>
    );
  }

  notFound();
}
