import Link from "next/link";

import { TextLink } from "@/components/TextLink";
import { guideCards, guidesPageCopy } from "@/constants/guides";
import {
  contactHref,
  helpCenterHref,
  howItWorksHref,
  shopDesignsHref,
} from "@/constants/siteNavigation";

type GuidesHubPageProps = {
  locale: string;
};

export function GuidesHubPage({ locale }: GuidesHubPageProps) {
  return (
    <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {guidesPageCopy.eyebrow}
      </p>
      <h1 className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        {guidesPageCopy.heading}
      </h1>
      <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
        {guidesPageCopy.body}
      </p>

      <ul className="mt-12 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
        {guideCards.map((card) => (
          <li key={card.number} className="border border-line bg-surface p-6 md:p-8">
            <p className="text-meta uppercase tracking-[0.18em] text-accent">
              {card.number}
            </p>
            <h2 className="mt-4 text-h3 font-medium tracking-tight text-ink">
              {card.title}
            </h2>
            <p className="mt-4 text-body leading-7 text-ink-soft">{card.body}</p>
            <div className="mt-8">
              <TextLink href={`/${locale}${card.href}`}>{card.cta}</TextLink>
            </div>
          </li>
        ))}
      </ul>

      <section className="mt-16 border-t border-line pt-12" aria-labelledby="guides-related">
        <h2
          id="guides-related"
          className="text-h3 font-medium tracking-tight text-ink"
        >
          {guidesPageCopy.relatedHeading}
        </h2>
        <ul className="mt-6 flex list-none flex-col gap-3 p-0 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
          <li>
            <TextLink href={`/${locale}${howItWorksHref}`}>
              {guidesPageCopy.howItWorks}
            </TextLink>
          </li>
          <li>
            <TextLink href={`/${locale}${helpCenterHref}`}>
              {guidesPageCopy.helpCenter}
            </TextLink>
          </li>
          <li>
            <TextLink href={`/${locale}${contactHref}`}>
              {guidesPageCopy.contact}
            </TextLink>
          </li>
        </ul>
        <div className="mt-10">
          <Link
            href={`/${locale}${shopDesignsHref}`}
            className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] text-ink underline-offset-4 hover:underline"
          >
            {guidesPageCopy.shopCta}
          </Link>
        </div>
      </section>
    </div>
  );
}
