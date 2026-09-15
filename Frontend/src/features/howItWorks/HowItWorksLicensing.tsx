import { TextLink } from "@/components/TextLink";
import { howItWorksPageCopy } from "@/constants/howItWorksPageCopy";
import { licensingHref } from "@/constants/siteNavigation";

type HowItWorksLicensingProps = {
  locale: string;
};

export function HowItWorksLicensing({ locale }: HowItWorksLicensingProps) {
  return (
    <section
      className="hiwReveal mx-auto w-full max-w-[85rem] px-6 py-12 md:py-16"
      aria-labelledby="hiw-license-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {howItWorksPageCopy.licenseEyebrow}
      </p>
      <h2
        id="hiw-license-heading"
        className="mt-3 text-h3 font-medium tracking-tight text-ink"
      >
        {howItWorksPageCopy.licenseHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {howItWorksPageCopy.licenseBody}
      </p>
      <div className="mt-6">
        <TextLink href={`/${locale}${licensingHref}`} tone="ghostOnLight">
          {howItWorksPageCopy.licenseCta}
        </TextLink>
      </div>
    </section>
  );
}
