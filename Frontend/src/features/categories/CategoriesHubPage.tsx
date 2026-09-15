import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import { TextLink } from "@/components/TextLink";
import { categoriesHubCopy } from "@/constants/categoriesHubCopy";
import {
  formatDesignCount,
  shopCategoryHref,
  type ShopProduct,
} from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { type CategoryStorefrontTile } from "@/lib/catalog/buildCategoryStorefrontTiles";

type CategoriesHubPageProps = {
  locale: string;
  products: readonly ShopProduct[];
  tiles: readonly CategoryStorefrontTile[];
};

function countForCategory(
  products: readonly ShopProduct[],
  categoryId: string,
): number {
  return products.filter((product) => product.categoryId === categoryId).length;
}

export function CategoriesHubPage({
  locale,
  products,
  tiles,
}: CategoriesHubPageProps) {
  return (
    <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {categoriesHubCopy.eyebrow}
      </p>
      <h1 className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        {categoriesHubCopy.heading}
      </h1>
      <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
        {categoriesHubCopy.body}
      </p>

      <ul className="mt-12 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tiles.map((tile) => {
          const count = countForCategory(products, tile.id);
          const href = shopCategoryHref(locale, tile.id);
          const countLabel = formatDesignCount(count);

          return (
            <li key={tile.id}>
              <Link
                href={href}
                className="group relative flex min-h-56 flex-col justify-end overflow-hidden border border-line bg-surface text-ink"
              >
                {tile.imageSrc !== null && tile.imageAlt !== null ? (
                  <>
                    <CoverImage
                      src={tile.imageSrc}
                      alt={tile.imageAlt}
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="absolute inset-0 size-full max-w-none object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-[var(--category-overlay)] transition-colors duration-500 group-hover:bg-[var(--category-overlay-hover)] motion-reduce:transition-none" />
                    <div className="relative z-10 flex items-end justify-between gap-4 p-5 text-paper">
                      <div>
                        <h2 className="text-h3 font-medium tracking-tight">
                          {tile.label}
                        </h2>
                        <p className="mt-2 text-meta uppercase tracking-[0.14em] text-paper/80">
                          {countLabel}
                        </p>
                      </div>
                      <span className="inline-flex transition-transform duration-500 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                        <ArrowRightIcon />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="relative z-10 flex h-full min-h-56 flex-col justify-between p-5">
                    <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                      {countLabel}
                    </p>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-h3 font-medium tracking-tight">
                          {tile.label}
                        </h2>
                        {count === 0 ? (
                          <p className="mt-2 text-meta leading-6 text-ink-soft">
                            {categoriesHubCopy.emptyNote}
                          </p>
                        ) : null}
                      </div>
                      <span className="inline-flex text-ink transition-transform duration-500 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                        <ArrowRightIcon />
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-12">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {categoriesHubCopy.browseAll}
        </TextLink>
      </div>
    </div>
  );
}
