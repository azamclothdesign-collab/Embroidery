import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { StarRating } from "@/components/StarRating";
import { WishlistButton } from "@/components/WishlistButton";
import {
  formatShopPrice,
  productPackageLabel,
  type ShopProduct,
  shopProductHref,
} from "@/constants/shopCatalog";
import { shopCopy } from "@/constants/shopCopy";

type CatalogProductCardProps = {
  locale: string;
  product: ShopProduct;
};

export function CatalogProductCard({ locale, product }: CatalogProductCardProps) {
  const designHref = shopProductHref(locale, product.slug);
  const hasStitched =
    product.stitchedImageSrc !== undefined && product.stitchedImageSrc.length > 0;

  return (
    <article className="shopCard group flex h-full flex-col">
      <div className="group/media relative aspect-4/3 overflow-hidden bg-line">
        <p className="absolute top-3 left-3 z-20 bg-paper px-3 py-1 text-meta uppercase tracking-[0.14em] text-ink">
          {product.badge}
        </p>
        <Link
          href={designHref}
          aria-label={`View ${product.name} design`}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover/media:scale-[1.035]">
            <CoverImage
              src={product.imageSrc}
              alt={product.imageAlt}
              sizes="(min-width: 1440px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="absolute inset-0 size-full max-w-none object-cover"
            />
            {hasStitched && product.stitchedImageSrc !== undefined ? (
              <div className="absolute inset-0 opacity-0 transition-opacity duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/media:opacity-100 motion-reduce:transition-none">
                <CoverImage
                  src={product.stitchedImageSrc}
                  alt={product.stitchedImageAlt ?? product.imageAlt}
                  sizes="(min-width: 1440px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="absolute inset-0 size-full max-w-none object-cover"
                />
              </div>
            ) : null}
          </div>
        </Link>
        <WishlistButton name={product.name} slug={product.slug} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden bg-[var(--category-overlay-hover)] p-4 opacity-0 transition-all duration-300 group-hover/media:opacity-100 motion-reduce:opacity-100 md:block [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:group-hover/media:translate-y-0">
          <span className="inline-flex min-h-11 w-full items-center justify-center bg-paper px-6 font-nourd text-base tracking-wide text-ink">
            {shopCopy.viewDesign}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 pt-3 transition-transform duration-300 ease-out motion-reduce:transition-none md:gap-2 md:pt-4 [@media(hover:hover)_and_(pointer:fine)]:group-hover:-translate-y-1">
        <h2 className="text-body font-medium tracking-tight text-ink">
          <Link href={designHref}>{product.name}</Link>
        </h2>
        <StarRating value={product.rating} />
        <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
          {productPackageLabel(product)}
        </p>
        <p className="text-body text-ink">{formatShopPrice(product.priceCents)}</p>
      </div>
    </article>
  );
}
