import { TextLink } from "@/components/TextLink";
import { productCopy } from "@/constants/productCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { ProductFinalCtaActions } from "@/features/product/ProductFinalCtaActions";

type ProductFinalCtaProps = {
  locale: string;
};

export function ProductFinalCta({ locale }: ProductFinalCtaProps) {
  return (
    <section className="productFinal border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2 className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {productCopy.finalHeading}
        </h2>
        <p className="mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {productCopy.finalBody}
        </p>
        <div className="mt-8 flex max-w-md flex-col gap-3">
          <ProductFinalCtaActions />
          <TextLink
            href={`/${locale}${shopDesignsHref}`}
            tone="ghostOnLight"
            className="w-full"
          >
            {productCopy.relatedCta}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
