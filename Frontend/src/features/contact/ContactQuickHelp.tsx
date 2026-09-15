import { TextLink } from "@/components/TextLink";
import {
  contactPageCopy,
  contactQuickHelp,
} from "@/constants/contactPageCopy";
import {
  accountHref,
  downloadsHref,
  howItWorksHref,
} from "@/constants/siteNavigation";

type ContactQuickHelpProps = {
  locale: string;
};

function quickHref(locale: string, href: string): string {
  if (href === "how-it-works") {
    return `/${locale}${howItWorksHref}`;
  }

  if (href === "downloads") {
    return `/${locale}${downloadsHref}`;
  }

  if (href === "orders") {
    return `/${locale}${accountHref}`;
  }

  return "#contact-faqs";
}

export function ContactQuickHelp({ locale }: ContactQuickHelpProps) {
  return (
    <section
      className="contactQuickHelp mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="contact-quick-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {contactPageCopy.quickEyebrow}
      </p>
      <h2
        id="contact-quick-heading"
        className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {contactPageCopy.quickHeading}
      </h2>
      <ul className="mt-12 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {contactQuickHelp.map((item) => (
          <li
            key={item.id}
            className="contactHelpCard border border-line bg-surface p-6 transition-[border-color] duration-300 hover:border-ink"
          >
            <p className="text-meta uppercase tracking-[0.18em] text-accent">
              {item.id}
            </p>
            <h3 className="mt-4 text-h3 font-medium tracking-tight text-ink">
              {item.title}
            </h3>
            <p className="mt-3 text-body leading-8 text-ink-soft">{item.body}</p>
            <div className="mt-8">
              <TextLink href={quickHref(locale, item.href)} tone="ghostOnLight">
                {item.cta}
              </TextLink>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
