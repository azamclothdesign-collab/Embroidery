import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { StarRating } from "@/components/StarRating";
import { TextLink } from "@/components/TextLink";
import { categoryPageCopy } from "@/constants/categoryPageCopy";
import {
  formatShopPrice,
  productPackageLabel,
  type ShopProduct,
  shopProductHref,
} from "@/constants/shopCatalog";

type CategoryPicksProps = {
  locale: string;
  products: readonly ShopProduct[];
  heading: string;
  eyebrow?: string;
  showFavoriteLabel?: boolean;
  headingId: string;
};

export function CategoryPicks({
  locale,
  products,
  heading,
  eyebrow,
  showFavoriteLabel = false,
  headingId,
}: CategoryPicksProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      className="categoryPicks categoryReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby={headingId}
    >
      {eyebrow !== undefined ? (
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={headingId}
        className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {heading}
      </h2>
      <ul className="mt-10 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <li key={product.slug} className="categoryPickCard">
            <Link
              href={shopProductHref(locale, product.slug)}
              className="group block"
            >
              <div className="relative aspect-square overflow-hidden bg-line">
                <CoverImage
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
              </div>
              <p className="mt-3 text-meta uppercase tracking-[0.14em] text-ink-soft">
                {product.categoryId}
              </p>
              <p className="mt-1 text-h3 font-medium tracking-tight text-ink">
                {product.name}
              </p>
              <p className="mt-2 text-meta text-ink-soft">
                {productPackageLabel(product)}
              </p>
              <p className="mt-2 text-body text-ink">
                {formatShopPrice(product.priceCents)}
              </p>
              {showFavoriteLabel ? (
                <div className="mt-2 flex items-center gap-2">
                  <StarRating value={product.rating} />
                  <span className="text-meta text-ink-soft">
                    {categoryPageCopy.favoriteLabel}
                  </span>
                </div>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <TextLink href="#category-collection">
          {categoryPageCopy.exploreDesigns}
        </TextLink>
      </div>
    </section>
  );
}
