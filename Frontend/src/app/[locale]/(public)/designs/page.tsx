import { type Metadata } from "next";

import { PageEnter } from "@/components/PageEnter";
import { PublicPageFrame } from "@/components/PublicPageFrame";
import { SiteHeader } from "@/components/SiteHeader";
import { parseShopCatalogSearchParams } from "@/features/shop/shopCatalogQuery";
import { ShopPage } from "@/features/shop/ShopPage";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchProducts } from "@/lib/api/productsApi";

type DesignsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "All Designs",
};

function parseDesignsQuery(
  queryValue: string | string[] | undefined,
): { ok: true; q: string } | { ok: false } {
  if (queryValue === undefined) {
    return { ok: true, q: "" };
  }

  if (typeof queryValue !== "string") {
    return { ok: false };
  }

  const q = queryValue.trim();

  if (q.length > 120) {
    return { ok: false };
  }

  return { ok: true, q };
}

export default async function DesignsPage({
  params,
  searchParams,
}: DesignsPageProps) {
  const { locale } = await params;
  const raw = await searchParams;
  const parsed = parseDesignsQuery(raw.q);

  if (!parsed.ok) {
    return (
      <PublicPageFrame title="Designs">
        The search query is invalid.
      </PublicPageFrame>
    );
  }

  const [initialProducts, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories().catch(() => []),
  ]);
  const catalog = parseShopCatalogSearchParams(raw, { q: parsed.q });

  return (
    <>
      <SiteHeader locale={locale} />
      <PageEnter>
        <ShopPage
          locale={locale}
          catalog={catalog}
          products={initialProducts}
          categories={categories}
        />
      </PageEnter>
    </>
  );
}
