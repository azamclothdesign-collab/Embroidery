import Link from "next/link";

import { StarRating } from "@/components/StarRating";
import { productPackageLabel, type ShopProduct, shopProductHref } from "@/constants/shopCatalog";
import { HomeBestSellerMedia } from "@/features/home/HomeBestSellerMedia";

type HomeBestSellerCardProps = {
  locale: string;
  product: ShopProduct;
};

function formatPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function HomeBestSellerCard({ locale, product }: HomeBestSellerCardProps) {
  const designHref = shopProductHref(locale, product.slug);

  return (
    <article className="flex h-full flex-col">
      <HomeBestSellerMedia product={product} designHref={designHref} />
      <div className="flex flex-1 flex-col gap-1 pt-3 md:gap-3 md:pt-5">
        <h3 className="text-body font-medium tracking-tight text-ink md:text-h3">
          <Link href={designHref}>{product.name}</Link>
        </h3>
        <div className="hidden md:block">
          <StarRating value={product.rating} />
        </div>
        <p className="hidden text-meta uppercase tracking-[0.16em] text-ink-soft md:block">
          {productPackageLabel(product)}
        </p>
        <p className="text-body text-ink">{formatPrice(product.priceCents)}</p>
      </div>
    </article>
  );
}
