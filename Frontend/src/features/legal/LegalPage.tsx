import Link from "next/link";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { TextLink } from "@/components/TextLink";
import {
  legalNavItems,
  type LegalPageContent,
  legalPageHref,
  legalSharedCopy,
} from "@/constants/legalPages";
import { contactHref } from "@/constants/siteNavigation";

type LegalPageProps = {
  locale: string;
  content: LegalPageContent;
  currentHref: string;
};

export function LegalPage({ locale, content, currentHref }: LegalPageProps) {
  return (
    <>
      <SiteHeader />
      <PageEnter>
        <div className="bg-paper">
          <div className="mx-auto w-full max-w-[85rem] px-6 py-12 md:py-16">
            <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
              <aside className="legalHeroCopy hidden lg:block">
                <p className="text-meta uppercase tracking-[0.22em] text-accent">
                  {legalSharedCopy.tocLabel}
                </p>
                <nav aria-label={legalSharedCopy.tocLabel} className="mt-6">
                  <ul className="flex list-none flex-col gap-2 p-0">
                    {content.sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
                        >
                          {section.heading}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>

              <article className="min-w-0">
                <p className="legalHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
                  {content.eyebrow}
                </p>
                <h1 className="legalHeroCopy mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
                  {content.heading}
                </h1>
                <p className="legalHeroCopy mt-6 max-w-3xl text-body leading-8 text-ink-soft">
                  {content.intro}
                </p>

                <div
                  className="legalHeroCopy mt-8 border border-line bg-surface px-5 py-5"
                  role="note"
                >
                  <p className="text-body leading-8 text-ink-soft">
                    {content.pendingNotice}
                  </p>
                </div>

                <div className="legalSections mt-14 flex flex-col gap-12">
                  {content.sections.map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className="legalSection scroll-mt-header-compact"
                      aria-labelledby={`${section.id}-heading`}
                    >
                      <h2
                        id={`${section.id}-heading`}
                        className="text-h3 font-medium tracking-tight text-ink"
                      >
                        {section.heading}
                      </h2>
                      <div className="mt-4 max-w-3xl space-y-4">
                        {section.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-body leading-8 text-ink-soft"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <section
                  className="mt-16 border-t border-line pt-12"
                  aria-labelledby="legal-related-heading"
                >
                  <h2
                    id="legal-related-heading"
                    className="text-h3 font-medium tracking-tight text-ink"
                  >
                    {legalSharedCopy.relatedHeading}
                  </h2>
                  <ul className="mt-6 flex list-none flex-wrap gap-3 p-0">
                    {legalNavItems.map((item) => {
                      const href = legalPageHref(locale, item.href);
                      const current = item.href === currentHref;

                      return (
                        <li key={item.href}>
                          {current ? (
                            <span className="inline-flex min-h-11 items-center border border-ink bg-ink px-4 text-meta uppercase tracking-[0.14em] text-paper">
                              {item.label}
                            </span>
                          ) : (
                            <Link
                              href={href}
                              className="inline-flex min-h-11 items-center border border-line px-4 text-meta uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="mt-14 border border-line bg-surface px-6 py-10">
                  <h2 className="text-h3 font-medium tracking-tight text-ink">
                    {legalSharedCopy.contactHeading}
                  </h2>
                  <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
                    {legalSharedCopy.contactBody}
                  </p>
                  <div className="mt-6">
                    <TextLink href={`/${locale}${contactHref}`}>
                      {legalSharedCopy.contactCta}
                    </TextLink>
                  </div>
                </section>
              </article>
            </div>
          </div>
        </div>
      </PageEnter>
    </>
  );
}
