import { TextLink } from "@/components/TextLink";
import { aboutPageCopy } from "@/constants/aboutPageCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type AboutFinalCtaProps = {
  locale: string;
};

export function AboutFinalCta({ locale }: AboutFinalCtaProps) {
  return (
    <section
      className="aboutReveal bg-paper"
      aria-labelledby="about-final-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center md:py-24">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {aboutPageCopy.finalEyebrow}
        </p>
        <h2
          id="about-final-heading"
          className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {aboutPageCopy.finalHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {aboutPageCopy.finalBody}
        </p>
        <div className="mt-10 flex justify-center">
          <TextLink href={`/${locale}${shopDesignsHref}`}>
            {aboutPageCopy.browseDesigns}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
