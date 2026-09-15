import { aboutPageCopy } from "@/constants/aboutPageCopy";

export function AboutWhy() {
  return (
    <section
      className="aboutReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="about-why-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {aboutPageCopy.whyEyebrow}
      </p>
      <h2
        id="about-why-heading"
        className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {aboutPageCopy.whyHeading}
      </h2>
      <div className="mt-8 max-w-2xl space-y-6">
        <p className="text-body leading-8 text-ink-soft">{aboutPageCopy.whyBody1}</p>
        <p className="text-body leading-8 text-ink-soft">{aboutPageCopy.whyBody2}</p>
      </div>
    </section>
  );
}
