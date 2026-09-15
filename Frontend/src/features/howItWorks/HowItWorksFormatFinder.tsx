import { TextLink } from "@/components/TextLink";
import { howItWorksPageCopy } from "@/constants/howItWorksPageCopy";
import { machineCompatibilityHref } from "@/constants/shopCatalog";
import { HowItWorksFinderIsland } from "@/features/howItWorks/HowItWorksFinderIsland";

type HowItWorksFormatFinderProps = {
  locale: string;
};

export function HowItWorksFormatFinder({ locale }: HowItWorksFormatFinderProps) {
  return (
    <section
      className="hiwReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="hiw-format-heading"
    >
      <h2
        id="hiw-format-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {howItWorksPageCopy.formatCtaHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {howItWorksPageCopy.formatCtaBody}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <TextLink href={`/${locale}${machineCompatibilityHref}`}>
          {howItWorksPageCopy.findMyMachine}
        </TextLink>
        <TextLink
          href={`/${locale}${machineCompatibilityHref}`}
          tone="ghostOnLight"
        >
          {howItWorksPageCopy.learnFormats}
        </TextLink>
      </div>
      <div className="mt-10 max-w-2xl">
        <HowItWorksFinderIsland locale={locale} />
      </div>
    </section>
  );
}
