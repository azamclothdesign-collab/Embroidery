import { aboutPageCopy } from "@/constants/aboutPageCopy";

export function AboutCraft() {
  return (
    <section
      className="aboutReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="about-craft-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {aboutPageCopy.craftEyebrow}
      </p>
      <h2
        id="about-craft-heading"
        className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {aboutPageCopy.craftHeading}
      </h2>
      <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
        {aboutPageCopy.craftBody}
      </p>
    </section>
  );
}
