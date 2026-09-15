import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { type ShopProduct } from "@/constants/shopCatalog";
import { ProductBuyProvider } from "@/features/product/ProductBuyProvider";
import { ProductDetails } from "@/features/product/ProductDetails";
import { ProductFinalCta } from "@/features/product/ProductFinalCta";
import { ProductHero } from "@/features/product/ProductHero";
import { ProductQuality } from "@/features/product/ProductQuality";
import { ProductRelated } from "@/features/product/ProductRelated";
import { ProductReviews } from "@/features/product/ProductReviews";
import { ProductStitchShowcase } from "@/features/product/ProductStitchShowcase";

type ProductPageProps = {
  locale: string;
  product: ShopProduct;
};

export function ProductPage({ locale, product }: ProductPageProps) {
  return (
    <>
      <SiteHeader />
      <PageEnter>
        <ProductBuyProvider locale={locale} product={product}>
          <ProductHero locale={locale} product={product} />
          <ProductDetails locale={locale} product={product} />
          <ProductStitchShowcase product={product} />
          <ProductQuality />
          <ProductReviews product={product} />
          <ProductRelated locale={locale} />
          <ProductFinalCta locale={locale} />
        </ProductBuyProvider>
      </PageEnter>
    </>
  );
}
