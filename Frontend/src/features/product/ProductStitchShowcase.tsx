import { CoverImage } from "@/components/CoverImage";
import { productCopy } from "@/constants/productCopy";
import { productShowcaseSteps } from "@/constants/productDetail";
import { type ShopProduct } from "@/constants/shopCatalog";

type ProductStitchShowcaseProps = {
  product: ShopProduct;
};

export function ProductStitchShowcase({ product }: ProductStitchShowcaseProps) {
  const steps = productShowcaseSteps(product);
  const firstStep = steps[0];

  return (
    <section
      className="productSection bg-ink text-paper"
      aria-labelledby="product-showcase-heading"
    >
      <div className="mx-auto grid w-full max-w-[85rem] gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="productShowcaseMedia relative aspect-square overflow-hidden bg-line">
          <CoverImage
            src={firstStep.src}
            alt={firstStep.alt}
            sizes="(min-width: 768px) 45vw, 100vw"
            className="absolute inset-0 size-full max-w-none object-cover"
          />
        </div>
        <div className="productShowcaseCopy">
          <p className="text-meta uppercase tracking-[0.22em] text-accent">
            {productCopy.showcaseEyebrow}
          </p>
          <h2
            id="product-showcase-heading"
            className="mt-4 text-title-sm font-medium tracking-tight md:text-title-md"
          >
            {productCopy.showcaseHeading}
          </h2>
          <ol className="mt-10 flex flex-col gap-6">
            {steps.map((step) => (
              <li key={step.id} className="flex flex-col gap-1">
                <span className="text-meta uppercase tracking-[0.16em] text-paper">
                  {step.label}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
