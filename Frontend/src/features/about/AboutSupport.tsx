import { TextLink } from "@/components/TextLink";
import { aboutPageCopy } from "@/constants/aboutPageCopy";
import { contactHref } from "@/constants/siteNavigation";

type AboutSupportProps = {
  locale: string;
};

export function AboutSupport({ locale }: AboutSupportProps) {
  return (
    <section
      className="aboutReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="about-support-heading"
    >
      <h2
        id="about-support-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {aboutPageCopy.supportHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {aboutPageCopy.supportBody}
      </p>
      <div className="mt-8">
        <TextLink href={`/${locale}${contactHref}`}>
          {aboutPageCopy.contactSupport}
        </TextLink>
      </div>
    </section>
  );
}
