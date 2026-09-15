import { TextLink } from "@/components/TextLink";
import { guideCards, guidesCopy } from "@/constants/guides";
import { guidesHref } from "@/constants/siteNavigation";

type HomeGuidesProps = {
  locale: string;
};

export function HomeGuides({ locale }: HomeGuidesProps) {
  return (
    <section className="bg-surface" aria-labelledby="guides-heading">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="text-meta uppercase tracking-[0.22em] text-ink-soft">
          {guidesCopy.eyebrow}
        </p>
        <h2
          id="guides-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
        >
          {guidesCopy.heading}
        </h2>
        <ul className="mt-16 grid list-none grid-cols-1 gap-12 p-0 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
          {guideCards.map((guide) => (
            <li key={guide.number} className="border-t border-line pt-8">
              <p className="text-meta uppercase tracking-[0.22em] text-accent">
                {guide.number}
              </p>
              <h3 className="mt-5 max-w-md text-h3 font-medium tracking-tight text-ink">
                {guide.title}
              </h3>
            </li>
          ))}
        </ul>
        <TextLink href={`/${locale}${guidesHref}`} tone="ink" className="mt-16">
          {guidesCopy.cta}
        </TextLink>
      </div>
    </section>
  );
}
