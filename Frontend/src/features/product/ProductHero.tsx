import Link from "next/link";

import { productGallery } from "@/constants/productDetail";
import { shopCategoryChips, type ShopProduct } from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { ProductBuyColumn } from "@/features/product/ProductBuyColumn";
import { ProductGallery } from "@/features/product/ProductGallery";

type ProductHeroProps = {
  locale: string;
  product: ShopProduct;
};

export function ProductHero({ locale, product }: ProductHeroProps) {
  const gallery = productGallery(product);
  const categoryLabel =
    shopCategoryChips.find((c) => c.id === product.categoryId)?.label ?? product.categoryId;

  return (
    <section className="mx-auto w-full max-w-[85rem] px-6 pt-8 pb-12 lg:min-h-[80vh] lg:pt-10 lg:pb-16">
      <nav aria-label="Breadcrumb" className="productBreadcrumb text-[0.8125rem] tracking-[0.04em] text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href={`/${locale}`} className="min-h-11 inline-flex items-center">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/${locale}${shopDesignsHref}`}
              className="min-h-11 inline-flex items-center"
            >
              Designs
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/${locale}${shopDesignsHref}`}
              className="min-h-11 inline-flex items-center"
            >
              {categoryLabel}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">{product.name}</li>
        </ol>
      </nav>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:gap-16 lg:min-h-[70vh]">
        <ProductGallery items={gallery} />
        <ProductBuyColumn locale={locale} product={product} />
      </div>
    </section>
  );
}
