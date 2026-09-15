import { TextLink } from "@/components/TextLink";
import { howItWorksPageCopy } from "@/constants/howItWorksPageCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type HowItWorksFinalCtaProps = {
  locale: string;
};

export function HowItWorksFinalCta({ locale }: HowItWorksFinalCtaProps) {
  return (
    <section
      className="hiwReveal border-t border-line bg-paper"
      aria-labelledby="hiw-final-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center md:py-24">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {howItWorksPageCopy.finalEyebrow}
        </p>
        <h2
          id="hiw-final-heading"
          className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {howItWorksPageCopy.finalHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {howItWorksPageCopy.finalBody}
        </p>
        <div className="mt-10 flex justify-center">
          <TextLink href={`/${locale}${shopDesignsHref}`}>
            {howItWorksPageCopy.browseDesigns}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
