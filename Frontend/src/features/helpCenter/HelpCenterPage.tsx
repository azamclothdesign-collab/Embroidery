import { TextLink } from "@/components/TextLink";
import {
  accountOrdersHref,
  contactHref,
  downloadsHref,
  howItWorksHref,
} from "@/constants/siteNavigation";

type HelpCenterPageProps = {
  locale: string;
};

export function HelpCenterPage({ locale }: HelpCenterPageProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        Help Center
      </p>
      <h1 className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        Find Answers Before You Reach Out.
      </h1>
      <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
        Start with the guides below. If you still need help, send a support
        message with your topic and order number.
      </p>
      <ul className="mt-10 flex list-none flex-col gap-4 p-0">
        <li>
          <TextLink href={`/${locale}${downloadsHref}`}>
            Download Help
          </TextLink>
        </li>
        <li>
          <TextLink href={`/${locale}${accountOrdersHref}`}>
            My Orders
          </TextLink>
        </li>
        <li>
          <TextLink href={`/${locale}${howItWorksHref}`}>
            How It Works
          </TextLink>
        </li>
        <li>
          <TextLink href={`/${locale}${contactHref}#contact-faqs`}>
            Common Questions
          </TextLink>
        </li>
        <li>
          <TextLink href={`/${locale}${contactHref}`}>Contact Support</TextLink>
        </li>
      </ul>
    </section>
  );
}
