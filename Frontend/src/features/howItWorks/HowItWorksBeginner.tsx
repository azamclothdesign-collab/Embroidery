import { TextLink } from "@/components/TextLink";
import {
  howItWorksBeginnerSteps,
  howItWorksPageCopy,
} from "@/constants/howItWorksPageCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type HowItWorksBeginnerProps = {
  locale: string;
};

export function HowItWorksBeginner({ locale }: HowItWorksBeginnerProps) {
  return (
    <section
      className="hiwReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="hiw-beginner-heading"
    >
      <h2
        id="hiw-beginner-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {howItWorksPageCopy.beginnerHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {howItWorksPageCopy.beginnerBody}
      </p>
      <ol className="mt-12 grid list-none gap-8 p-0 md:grid-cols-3">
        {howItWorksBeginnerSteps.map((step) => (
          <li key={step.id} className="border-t border-line pt-6">
            <p className="text-meta uppercase tracking-[0.18em] text-accent">
              {step.id}
            </p>
            <h3 className="mt-3 text-h3 font-medium tracking-tight text-ink">
              {step.title}
            </h3>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {howItWorksPageCopy.beginnerCta}
        </TextLink>
      </div>
    </section>
  );
}
