import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import {
  howItWorksJourneySteps,
  howItWorksPageCopy,
} from "@/constants/howItWorksPageCopy";
import {
  formatShopPrice,
  productPackageLabel,
  type ShopProduct,
} from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";

type HowItWorksJourneyProps = {
  locale: string;
  products: readonly ShopProduct[];
};

function stepHref(locale: string): string {
  return `/${locale}${shopDesignsHref}`;
}

export function HowItWorksJourney({ locale, products }: HowItWorksJourneyProps) {
  const product = products[0];
  const price = product === undefined ? "$4.99" : formatShopPrice(product.priceCents);
  const packageLabel =
    product === undefined ? "ZIP package" : productPackageLabel(product);
  const sizeLabel = product?.hoopSize ?? '4 × 4"';
  const stitchLabel =
    product === undefined
      ? "18,452"
      : new Intl.NumberFormat("en-US").format(product.stitchCount);

  return (
    <section
      className="hiwJourney mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-label="Five-step journey"
    >
      <div className="relative hidden md:block">
        <div className="absolute top-5 right-0 left-0 h-px origin-left bg-line" />
        <div className="hiwJourneyProgress absolute top-5 right-0 left-0 h-px origin-left bg-ink" />
        <ol className="relative grid list-none grid-cols-5 gap-4 p-0">
          {howItWorksPageCopy.journeyNav.map((item) => (
            <li key={item.id} className="text-center">
              <span className="mx-auto flex size-10 items-center justify-center border border-ink bg-paper text-meta text-ink">
                {item.id}
              </span>
              <p className="mt-4 text-meta uppercase tracking-[0.16em] text-ink">
                {item.label}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <ol className="mt-14 flex list-none flex-col gap-16 p-0 md:mt-20 md:gap-24">
        {howItWorksJourneySteps.map((step) => (
          <li
            key={step.id}
            id={`hiw-${step.anchor}`}
            className="hiwJourneyStep grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14"
          >
            <div>
              <p className="text-meta uppercase tracking-[0.18em] text-accent">
                {step.id}
              </p>
              <h3 className="mt-3 text-title-sm font-medium tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-4 max-w-xl text-body leading-8 text-ink-soft">
                {step.body}
              </p>
              {step.id === "03" ? (
                <p className="mt-4 max-w-xl text-meta leading-6 text-ink-soft">
                  {howItWorksPageCopy.digitalNotice}
                </p>
              ) : null}
              <div className="mt-8">
                <TextLink href={stepHref(locale)}>
                  {step.cta}
                </TextLink>
              </div>
            </div>

            <div className="border border-line bg-surface p-6 md:p-8">
              {step.id === "01" && product !== undefined ? (
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="relative aspect-square w-full max-w-[10rem] overflow-hidden bg-line">
                    <CoverImage
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      sizes="160px"
                      className="absolute inset-0 size-full max-w-none object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-h3 font-medium text-ink">{product.name}</p>
                    <p className="mt-2 text-meta text-ink-soft">Floral</p>
                    <p className="mt-4 text-meta text-ink-soft">
                      {sizeLabel} · {stitchLabel} stitches
                    </p>
                    <p className="mt-2 text-body text-ink">{packageLabel}</p>
                  </div>
                </div>
              ) : null}

              {step.id === "02" ? (
                <div className="text-center">
                  <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
                    Embroidery package
                  </p>
                  <p className="mt-4 text-meta text-ink-soft" aria-hidden="true">
                    ↓
                  </p>
                  <p className="mt-4 text-title-sm font-medium text-ink">ZIP</p>
                  <p className="mt-3 text-meta uppercase tracking-[0.14em] text-ink">
                    Single download after purchase
                  </p>
                </div>
              ) : null}

              {step.id === "03" ? (
                <div className="space-y-4 text-center">
                  <div className="border border-line bg-paper px-4 py-5">
                    <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                      Design
                    </p>
                    <p className="mt-2 text-h3 text-ink">{price}</p>
                  </div>
                  <p className="text-meta text-ink-soft" aria-hidden="true">
                    +
                  </p>
                  <div className="border border-line bg-paper px-4 py-5">
                    <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                      Cart
                    </p>
                    <p className="mt-2 text-h3 text-ink">{price}</p>
                  </div>
                  <p className="text-meta text-ink-soft" aria-hidden="true">
                    ↓
                  </p>
                  <p className="text-meta uppercase tracking-[0.16em] text-ink">
                    Secure Checkout
                  </p>
                </div>
              ) : null}

              {step.id === "04" ? (
                <div className="text-center">
                  <p className="text-meta uppercase tracking-[0.16em] text-accent">
                    Payment Confirmed
                  </p>
                  <p className="mt-4 text-meta text-ink-soft" aria-hidden="true">
                    ↓
                  </p>
                  <p className="mt-4 text-h3 font-medium text-ink">ZIP Ready</p>
                  <p className="mt-6 border border-line px-4 py-3 text-meta uppercase tracking-[0.14em] text-ink">
                    Single embroidery package
                  </p>
                  <p className="mt-6 text-meta uppercase tracking-[0.14em] text-ink">
                    Download ZIP
                  </p>
                </div>
              ) : null}

              {step.id === "05" ? (
                <div className="space-y-4 text-center">
                  <div className="relative mx-auto aspect-square w-28 overflow-hidden bg-line">
                    <CoverImage
                      src={product?.imageSrc ?? fromScreenToStitchPosterSrc}
                      alt={product?.imageAlt ?? "Digital embroidery design"}
                      sizes="112px"
                      className="absolute inset-0 size-full max-w-none object-cover"
                    />
                  </div>
                  <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                    Digital Design
                  </p>
                  <p className="text-meta text-ink-soft" aria-hidden="true">
                    ↓
                  </p>
                  <p className="text-meta uppercase tracking-[0.14em] text-ink">
                    Embroidery Machine
                  </p>
                  <p className="text-meta text-ink-soft" aria-hidden="true">
                    ↓
                  </p>
                  <div className="relative mx-auto aspect-[4/3] w-36 overflow-hidden bg-line">
                    <CoverImage
                      src={
                        product?.stitchedImageSrc ??
                        product?.imageSrc ??
                        fromScreenToStitchPosterSrc
                      }
                      alt={
                        product?.stitchedImageAlt ??
                        product?.imageAlt ??
                        "Finished embroidery project"
                      }
                      sizes="144px"
                      className="absolute inset-0 size-full max-w-none object-cover"
                    />
                  </div>
                  <p className="text-meta uppercase tracking-[0.14em] text-ink">
                    Finished Project
                  </p>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
