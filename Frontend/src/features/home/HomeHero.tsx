import { TextLink } from "@/components/TextLink";
import { defaultLocale } from "@/constants/locales";
import { howItWorksHref, shopDesignsHref } from "@/constants/siteNavigation";

type HomeHeroProps = {
  locale?: string;
};

export function HomeHero({ locale = defaultLocale }: HomeHeroProps) {
  return (
    <section className="relative bg-paper" aria-labelledby="home-hero-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent_68%)]"
      />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-6 text-center md:py-8">
        <h1
          id="home-hero-heading"
          className="w-full text-[1.75rem] font-medium leading-[1.12] tracking-tight text-ink sm:text-[2.5rem] md:text-[3.25rem] md:leading-[1.08]"
        >
          Designs Made to
          <span className="block">Be Stitched.</span>
        </h1>
        <p className="mt-2.5 w-full max-w-xl text-body leading-6 text-ink-soft md:mt-3 md:text-[1.05rem] md:leading-7">
          Professionally digitized embroidery designs, ready to download and stitch.
        </p>
        <div className="mt-4 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <TextLink
            href={`/${locale}${shopDesignsHref}`}
            tone="ink"
            className="w-full sm:w-auto"
          >
            Explore Designs
          </TextLink>
          <TextLink
            href={`/${locale}${howItWorksHref}`}
            tone="ghostOnLight"
            className="w-full sm:w-auto"
          >
            How It Works
          </TextLink>
        </div>
      </div>
    </section>
  );
}
