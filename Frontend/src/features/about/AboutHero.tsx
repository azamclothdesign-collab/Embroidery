import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { aboutPageCopy } from "@/constants/aboutPageCopy";
import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import { shopDesignsHref } from "@/constants/siteNavigation";

type AboutHeroProps = {
  locale: string;
};

export function AboutHero({ locale }: AboutHeroProps) {
  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden md:min-h-[78vh]">
      <div className="absolute inset-0">
        <CoverImage
          src={fromScreenToStitchPosterSrc}
          alt="Close-up of embroidery thread stitched into cream linen"
          sizes="100vw"
          priority
          className="absolute inset-0 size-full max-w-none object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-[85rem] flex-col justify-end px-6 py-16 text-paper md:min-h-[78vh] md:py-20">
        <p className="aboutHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
          {aboutPageCopy.eyebrow}
        </p>
        <h1 className="aboutHeroCopy mt-4 max-w-3xl text-title-sm font-medium tracking-tight md:text-title-md lg:text-title-lg">
          {aboutPageCopy.heading}
        </h1>
        <p className="aboutHeroCopy mt-6 max-w-2xl text-body leading-8 text-paper/85">
          {aboutPageCopy.body}
        </p>
        <div className="aboutHeroCopy mt-8 flex flex-col gap-3 sm:flex-row">
          <TextLink href={`/${locale}${shopDesignsHref}`} tone="paper">
            {aboutPageCopy.exploreDesigns}
          </TextLink>
          <TextLink href="#our-approach" tone="ghostOnDark">
            {aboutPageCopy.ourApproach}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
