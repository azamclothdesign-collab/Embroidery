import { TextLink } from "@/components/TextLink";
import { contactPageCopy } from "@/constants/contactPageCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type ContactFinalCtaProps = {
  locale: string;
};

export function ContactFinalCta({ locale }: ContactFinalCtaProps) {
  return (
    <section
      className="contactReveal border-t border-line bg-paper"
      aria-labelledby="contact-final-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center md:py-24">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {contactPageCopy.finalEyebrow}
        </p>
        <h2
          id="contact-final-heading"
          className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {contactPageCopy.finalHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {contactPageCopy.finalBody}
        </p>
        <div className="mt-10 flex justify-center">
          <TextLink href={`/${locale}${shopDesignsHref}`}>
            {contactPageCopy.browseDesigns}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
