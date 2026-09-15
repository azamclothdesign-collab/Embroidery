import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import { cartCopy } from "@/constants/cartCopy";
import { fromScreenToStitchCopy } from "@/constants/fromScreenToStitch";
import { shopDesignsHref } from "@/constants/siteNavigation";

type CartEmptyProps = {
  locale: string;
};

export function CartEmpty({ locale }: CartEmptyProps) {
  return (
    <section className="mx-auto flex w-full max-w-[85rem] flex-col gap-10 px-6 py-10 md:flex-row md:items-center md:gap-16 md:py-16">
      <div className="cartEmptyVisual relative aspect-[4/3] w-full overflow-hidden bg-line md:max-w-xl">
        <CoverImage
          src={fromScreenToStitchPosterSrc}
          alt={fromScreenToStitchCopy.imageAlt}
          sizes="(min-width: 768px) 40vw, 100vw"
          priority
          className="absolute inset-0 size-full max-w-none object-cover"
        />
      </div>
      <div className="max-w-xl">
        <p className="cartEmptyCopy text-meta uppercase tracking-[0.22em] text-accent">
          {cartCopy.emptyEyebrow}
        </p>
        <h1 className="cartEmptyCopy mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {cartCopy.emptyHeading}
        </h1>
        <p className="cartEmptyCopy mt-6 text-body leading-8 text-ink-soft">
          {cartCopy.emptyBody}
        </p>
        <div className="cartEmptyCopy mt-8 flex flex-col gap-3 sm:flex-row">
          <TextLink href={`/${locale}${shopDesignsHref}`}>
            {cartCopy.exploreDesigns}
          </TextLink>
          <TextLink
            href={`/${locale}${shopDesignsHref}`}
            tone="ghostOnLight"
          >
            {cartCopy.browsePopular}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
