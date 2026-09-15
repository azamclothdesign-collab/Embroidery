import { TextLink } from "@/components/TextLink";
import {
  machineCompatibilityBeginnerSteps,
  machineCompatibilityPageCopy,
} from "@/constants/machineCompatibilityPageCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type MachineBeginnerGuideProps = {
  locale: string;
};

export function MachineBeginnerGuide({ locale }: MachineBeginnerGuideProps) {
  return (
    <section
      className="machineReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="beginner-heading"
    >
      <h2
        id="beginner-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {machineCompatibilityPageCopy.beginnerHeading}
      </h2>
      <ol className="mt-12 grid list-none gap-8 p-0 md:grid-cols-3">
        {machineCompatibilityBeginnerSteps.map((step) => (
          <li key={step.id} className="border-t border-line pt-6">
            <p className="text-meta uppercase tracking-[0.18em] text-accent">
              {step.id}
            </p>
            <h3 className="mt-3 text-h3 font-medium tracking-tight text-ink">
              {step.title}
            </h3>
            <p className="mt-3 text-body leading-8 text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {machineCompatibilityPageCopy.beginnerCta}
        </TextLink>
      </div>
    </section>
  );
}
