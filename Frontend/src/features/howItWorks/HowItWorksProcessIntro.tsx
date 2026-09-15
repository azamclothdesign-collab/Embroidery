import { howItWorksPageCopy } from "@/constants/howItWorksPageCopy";

export function HowItWorksProcessIntro() {
  return (
    <section
      className="hiwReveal border-y border-line bg-surface"
      aria-labelledby="hiw-process-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {howItWorksPageCopy.processEyebrow}
        </p>
        <h2
          id="hiw-process-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {howItWorksPageCopy.processHeading}
        </h2>
        <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
          {howItWorksPageCopy.processBody}
        </p>
      </div>
    </section>
  );
}
