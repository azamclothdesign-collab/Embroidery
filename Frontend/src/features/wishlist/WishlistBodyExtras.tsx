import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import {
  formatShopPrice,
  productPackageLabel,
  type ShopProduct,
  shopProductHref,
} from "@/constants/shopCatalog";
import { cartHref, shopDesignsHref } from "@/constants/siteNavigation";
import { wishlistCopy } from "@/constants/wishlistCopy";

type LocaleProps = {
  locale: string;
};

export function WishlistPopular({
  locale,
  products,
}: LocaleProps & { products: readonly ShopProduct[] }) {
  return (
    <section
      className="wishlistReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="wishlist-popular-heading"
    >
      <h2
        id="wishlist-popular-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {wishlistCopy.popularHeading}
      </h2>
      <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.slug}>
            <Link
              href={shopProductHref(locale, product.slug)}
              className="group block"
            >
              <span className="relative block aspect-4/3 overflow-hidden bg-line">
                <CoverImage
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
              </span>
              <span className="mt-3 block text-body font-medium text-ink">
                {product.name}
              </span>
              <span className="mt-1 block text-meta uppercase tracking-[0.14em] text-ink-soft">
                {productPackageLabel(product)}
              </span>
              <span className="mt-1 block text-body text-ink">
                {formatShopPrice(product.priceCents)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {wishlistCopy.popularCta}
        </TextLink>
      </div>
    </section>
  );
}

type WishlistFinalCtaProps = LocaleProps & {
  hasItems: boolean;
};

export function WishlistFinalCta({ locale, hasItems }: WishlistFinalCtaProps) {
  return (
    <section className="wishlistReveal border-t border-line bg-paper">
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center md:py-24">
        <h2 className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {hasItems
            ? wishlistCopy.finalPopulatedHeading
            : wishlistCopy.finalEmptyHeading}
        </h2>
        {hasItems ? (
          <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-ink-soft">
            {wishlistCopy.finalPopulatedBody}
          </p>
        ) : null}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {hasItems ? (
            <>
              <TextLink href={`/${locale}${cartHref}`}>
                {wishlistCopy.viewCart}
              </TextLink>
              <TextLink href={`/${locale}${shopDesignsHref}`} tone="ghostOnLight">
                {wishlistCopy.keepExploring}
              </TextLink>
            </>
          ) : (
            <TextLink href={`/${locale}${shopDesignsHref}`}>
              {wishlistCopy.exploreDesigns}
            </TextLink>
          )}
        </div>
      </div>
    </section>
  );
}
