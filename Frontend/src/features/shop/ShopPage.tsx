import { shopPageSize, type ShopProduct } from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";
import {
  resolveShopCatalog,
  type ShopCatalogQuery,
} from "@/features/shop/shopCatalogQuery";
import { ShopCatalogToolbar } from "@/features/shop/ShopCatalogToolbar";
import { ShopCategoryChips } from "@/features/shop/ShopCategoryChips";
import { ShopEmptyState } from "@/features/shop/ShopEmptyState";
import { ShopHero } from "@/features/shop/ShopHero";
import { ShopNewsletter } from "@/features/shop/ShopNewsletter";
import { ShopPagination } from "@/features/shop/ShopPagination";
import { ShopProductGrid } from "@/features/shop/ShopProductGrid";
import { ShopQuality } from "@/features/shop/ShopQuality";
import { ShopScrollMotion } from "@/features/shop/ShopScrollMotion";
import { type CategoryRecord } from "@/types/api/product";

type ShopPageProps = {
  locale: string;
  catalog: ShopCatalogQuery;
  products: readonly ShopProduct[];
  categories: readonly CategoryRecord[];
};

export function ShopPage({
  locale,
  catalog,
  products,
  categories,
}: ShopPageProps) {
  const { matched, visible, activeFilterCount } = resolveShopCatalog(
    products,
    catalog,
    shopPageSize,
  );
  const path = shopDesignsHref;

  return (
    <ShopScrollMotion>
      <ShopHero locale={locale} catalog={catalog} products={products} />
      <ShopCategoryChips
        locale={locale}
        activeId={catalog.filters.categoryId}
        categories={categories}
      />
      <ShopCatalogToolbar
        locale={locale}
        path={path}
        catalog={catalog}
        totalCount={matched.length}
      />
      {matched.length === 0 ? (
        <ShopEmptyState
          locale={locale}
          path={path}
          catalog={catalog}
          kind={activeFilterCount > 0 ? "filters" : "search"}
        />
      ) : (
        <ShopProductGrid locale={locale} products={visible} />
      )}
      <ShopPagination
        locale={locale}
        path={path}
        catalog={catalog}
        visibleCount={visible.length}
        totalCount={matched.length}
      />
      <ShopQuality />
      <ShopNewsletter />
    </ShopScrollMotion>
  );
}
