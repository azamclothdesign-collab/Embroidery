import { machineCompatibilityCopy } from "@/constants/machineFormats";
import { HomeMachineSelector } from "@/features/home/HomeMachineSelector";

type HomeMachineCompatibilityProps = {
  locale: string;
};

export function HomeMachineCompatibility({
  locale,
}: HomeMachineCompatibilityProps) {
  return (
    <section
      id="machine-compatibility"
      className="scroll-mt-header-compact bg-ink text-paper"
      aria-labelledby="machine-compatibility-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {machineCompatibilityCopy.eyebrow}
        </p>
        <h2
          id="machine-compatibility-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-paper md:text-title-lg"
        >
          {machineCompatibilityCopy.heading}
        </h2>
        <p className="mt-8 max-w-2xl text-body leading-8 text-paper/80">
          {machineCompatibilityCopy.body}
        </p>
        <HomeMachineSelector locale={locale} />
      </div>
    </section>
  );
}
