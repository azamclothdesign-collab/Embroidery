import { CoverImage } from "@/components/CoverImage";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { TextLink } from "@/components/TextLink";
import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import { fromScreenToStitchCopy } from "@/constants/fromScreenToStitch";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { wishlistCopy } from "@/constants/wishlistCopy";

type WishlistEmptyProps = {
  locale: string;
};

export function WishlistEmpty({ locale }: WishlistEmptyProps) {
  return (
    <section className="mx-auto flex w-full max-w-[85rem] flex-col items-center px-6 py-16 text-center md:py-24">
      <span className="wishlistHeroCopy inline-flex size-14 items-center justify-center text-ink">
        <HeartIcon />
      </span>
      <h2 className="wishlistHeroCopy mt-6 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        {wishlistCopy.emptyHeading}
      </h2>
      <p className="wishlistHeroCopy mt-4 max-w-lg text-body leading-8 text-ink-soft">
        {wishlistCopy.emptyBody}
      </p>
      <div className="wishlistHeroCopy mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {wishlistCopy.exploreDesigns}
        </TextLink>
        <TextLink href={`/${locale}${shopDesignsHref}`} tone="ghostOnLight">
          {wishlistCopy.browseBestSellers}
        </TextLink>
      </div>
      <div className="wishlistReveal relative mt-14 aspect-[16/7] w-full max-w-3xl overflow-hidden bg-line">
        <CoverImage
          src={fromScreenToStitchPosterSrc}
          alt={fromScreenToStitchCopy.imageAlt}
          sizes="(min-width: 768px) 48rem, 100vw"
          className="absolute inset-0 size-full max-w-none object-cover opacity-90"
        />
      </div>
    </section>
  );
}
