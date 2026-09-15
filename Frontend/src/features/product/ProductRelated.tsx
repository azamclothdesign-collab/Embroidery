import { TextLink } from "@/components/TextLink";
import { productCopy } from "@/constants/productCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type ProductRelatedProps = {
  locale: string;
};

export function ProductRelated({ locale }: ProductRelatedProps) {
  return (
    <section
      className="productRelated mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="product-related-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {productCopy.relatedEyebrow}
      </p>
      <h2
        id="product-related-heading"
        className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {productCopy.relatedHeading}
      </h2>
      <div className="mt-8">
        <TextLink href={`/${locale}${shopDesignsHref}`}>{productCopy.relatedCta}</TextLink>
      </div>
    </section>
  );
}
