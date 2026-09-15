import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import { howItWorksPageCopy } from "@/constants/howItWorksPageCopy";
import { type ShopProduct } from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";

type HowItWorksHeroProps = {
  locale: string;
  products: readonly ShopProduct[];
};

export function HowItWorksHero({ locale, products }: HowItWorksHeroProps) {
  const product = products[0];
  const designSrc = product?.imageSrc ?? fromScreenToStitchPosterSrc;
  const designAlt = product?.imageAlt ?? "Embroidery design preview";
  const stitchedSrc = product?.stitchedImageSrc ?? fromScreenToStitchPosterSrc;
  const stitchedAlt = product?.stitchedImageAlt ?? designAlt;

  return (
    <section className="bg-paper">
      <div className="mx-auto grid w-full max-w-[85rem] gap-12 px-6 pt-14 pb-16 md:pt-20 md:pb-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
        <div>
          <p className="howHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
            {howItWorksPageCopy.eyebrow}
          </p>
          <h1 className="howHeroCopy mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md lg:text-title-lg">
            {howItWorksPageCopy.heading}
          </h1>
          <p className="howHeroCopy mt-6 max-w-xl text-body leading-8 text-ink-soft">
            {howItWorksPageCopy.body}
          </p>
          <div className="howHeroCopy mt-8">
            <TextLink href={`/${locale}${shopDesignsHref}`}>
              {howItWorksPageCopy.browseDesigns}
            </TextLink>
          </div>
        </div>

        <div className="flex flex-col items-center text-center" aria-hidden="true">
          <div className="hiwHeroStage relative aspect-square w-full max-w-[14rem] overflow-hidden border border-line bg-line">
            <CoverImage
              src={designSrc}
              alt={designAlt}
              sizes="224px"
              priority
              className="absolute inset-0 size-full max-w-none object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-paper/90 px-3 py-2 text-meta uppercase tracking-[0.16em] text-ink">
              {howItWorksPageCopy.heroStages[0]}
            </span>
          </div>
          <div className="hiwHeroConnector my-3 h-8 w-px origin-top bg-line" />
          <div className="hiwHeroStage border border-line bg-surface px-8 py-5">
            <p className="text-meta uppercase tracking-[0.18em] text-ink-soft">
              Digital File
            </p>
            <p className="mt-2 text-h3 font-medium tracking-tight text-ink">
              PES · DST · JEF
            </p>
          </div>
          <div className="hiwHeroConnector my-3 h-8 w-px origin-top bg-line" />
          <div className="hiwHeroStage border border-line bg-paper px-8 py-5">
            <p className="text-meta uppercase tracking-[0.18em] text-ink-soft">
              {howItWorksPageCopy.heroStages[2]}
            </p>
            <p className="mt-2 text-body text-ink">Ready to transfer</p>
          </div>
          <div className="hiwHeroConnector my-3 h-8 w-px origin-top bg-line" />
          <div className="hiwHeroStage relative aspect-[4/3] w-full max-w-[14rem] overflow-hidden border border-line bg-line">
            <CoverImage
              src={stitchedSrc}
              alt={stitchedAlt}
              sizes="224px"
              className="absolute inset-0 size-full max-w-none object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-paper/90 px-3 py-2 text-meta uppercase tracking-[0.16em] text-ink">
              {howItWorksPageCopy.heroStages[3]}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
