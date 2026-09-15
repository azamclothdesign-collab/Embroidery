import { TextLink } from "@/components/TextLink";
import {
  categoryPageCopy,
  getCategoryPageContent,
} from "@/constants/categoryPageCopy";
import {
  shopCategoryHref,
  shopPageSize,
  type ShopProduct,
} from "@/constants/shopCatalog";
import {
  CategoryBeginner,
  CategoryFinalCta,
  CategoryProjects,
  CategoryRelated,
  CategorySeo,
} from "@/features/shop/CategoryExtras";
import { CategoryHero } from "@/features/shop/CategoryHero";
import { CategoryIntro } from "@/features/shop/CategoryIntro";
import { CategoryPicks } from "@/features/shop/CategoryPicks";
import { CategoryScrollMotion } from "@/features/shop/CategoryScrollMotion";
import {
  resolveShopCatalog,
  type ShopCatalogQuery,
} from "@/features/shop/shopCatalogQuery";
import { ShopCatalogToolbar } from "@/features/shop/ShopCatalogToolbar";
import { ShopEmptyState } from "@/features/shop/ShopEmptyState";
import { ShopPagination } from "@/features/shop/ShopPagination";
import { ShopProductGrid } from "@/features/shop/ShopProductGrid";

type CategoryPageProps = {
  locale: string;
  categoryId: string;
  catalog: ShopCatalogQuery;
  products: readonly ShopProduct[];
};

export function CategoryPage({
  locale,
  categoryId,
  catalog,
  products,
}: CategoryPageProps) {
  const content = getCategoryPageContent(categoryId);
  const { matched, visible, activeFilterCount } = resolveShopCatalog(
    products,
    catalog,
    shopPageSize,
  );
  const path = shopCategoryHref(locale, categoryId).replace(`/${locale}`, "");

  return (
    <CategoryScrollMotion>
      <CategoryHero locale={locale} content={content} />
      <CategoryIntro content={content} />
      <CategoryPicks
        locale={locale}
        products={matched}
        eyebrow={categoryPageCopy.editorsEyebrow}
        heading={categoryPageCopy.editorsHeading}
        headingId="category-editors-heading"
      />

      <section
        id="category-collection"
        className="scroll-mt-header-compact border-t border-line"
        aria-labelledby="category-collection-heading"
      >
        <div className="mx-auto w-full max-w-[85rem] px-6 pt-14 md:pt-16">
          <p className="text-meta uppercase tracking-[0.22em] text-accent">
            {categoryPageCopy.collectionEyebrow}
          </p>
          <h2
            id="category-collection-heading"
            className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
          >
            {content.collectionHeading}
          </h2>
        </div>
        <ShopCatalogToolbar
          locale={locale}
          path={path}
          catalog={catalog}
          totalCount={matched.length}
        />
        {catalog.filters.formats.length > 0 ? (
          <div className="mx-auto flex w-full max-w-[85rem] flex-wrap items-center gap-2 px-6 pb-4">
            {catalog.filters.formats.map((format) => (
              <span
                key={format}
                className="inline-flex min-h-11 items-center border border-line px-4 text-meta uppercase tracking-[0.14em] text-ink"
              >
                {format}
              </span>
            ))}
            <TextLink
              href={`/${locale}${path}`}
              tone="ghostOnLight"
              className="min-h-11 px-4"
            >
              {categoryPageCopy.clearFilters}
            </TextLink>
          </div>
        ) : null}

        {matched.length === 0 ? (
          <ShopEmptyState
            locale={locale}
            path={path}
            catalog={catalog}
            kind={activeFilterCount > 0 ? "filters" : "search"}
          />
        ) : (
          <div className="categoryGrid pb-8">
            <ShopProductGrid locale={locale} products={visible} />
            <ShopPagination
              locale={locale}
              path={path}
              catalog={catalog}
              visibleCount={visible.length}
              totalCount={matched.length}
            />
          </div>
        )}
      </section>

      <CategoryProjects content={content} />
      <CategoryPicks
        locale={locale}
        products={matched}
        heading={categoryPageCopy.favoritesHeading}
        showFavoriteLabel
        headingId="category-favorites-heading"
      />
      <CategoryBeginner locale={locale} />
      <CategorySeo content={content} />
      <CategoryRelated locale={locale} currentId={categoryId} />
      <CategoryFinalCta locale={locale} />
    </CategoryScrollMotion>
  );
}
