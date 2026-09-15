import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { StarRating } from "@/components/StarRating";
import { TextLink } from "@/components/TextLink";
import { newArrivalsCopy } from "@/constants/newArrivalsCopy";
import {
  formatShopPrice,
  productPackageLabel,
  type ShopProduct,
  shopProductHref,
} from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";

type NewArrivalsPageProps = {
  locale: string;
  products: readonly ShopProduct[];
};

export function NewArrivalsPage({ locale, products }: NewArrivalsPageProps) {
  const hasProducts = products.length > 0;

  return (
    <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {newArrivalsCopy.eyebrow}
      </p>
      <h1 className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        {newArrivalsCopy.heading}
      </h1>
      <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
        {newArrivalsCopy.body}
      </p>
      {hasProducts ? (
        <p className="mt-3 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {newArrivalsCopy.catalogNote}
        </p>
      ) : null}

      {hasProducts ? (
        <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const href = shopProductHref(locale, product.slug);

            return (
              <li key={product.slug} className="flex flex-col border border-line bg-surface">
                <Link href={href} className="relative block aspect-[4/5] overflow-hidden bg-paper">
                  <CoverImage
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="absolute inset-0 size-full max-w-none object-cover object-center"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <Link href={href} className="text-h3 font-medium tracking-tight text-ink">
                    {product.name}
                  </Link>
                  <StarRating value={product.rating} />
                  <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                    {productPackageLabel(product)}
                  </p>
                  <p className="text-body text-ink">
                    {formatShopPrice(product.priceCents)}
                  </p>
                  <div className="mt-auto pt-2">
                    <TextLink href={href} tone="ghostOnLight">
                      View Design
                    </TextLink>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-12 border border-line bg-surface px-6 py-10">
          <h2 className="text-h3 font-medium tracking-tight text-ink">
            {newArrivalsCopy.emptyHeading}
          </h2>
          <p className="mt-4 max-w-xl text-body leading-7 text-ink-soft">
            {newArrivalsCopy.emptyBody}
          </p>
        </div>
      )}

      <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {newArrivalsCopy.browseAll}
        </TextLink>
        <TextLink href={`/${locale}/categories`} tone="ghostOnLight">
          {newArrivalsCopy.browseCategories}
        </TextLink>
      </div>
    </div>
  );
}
