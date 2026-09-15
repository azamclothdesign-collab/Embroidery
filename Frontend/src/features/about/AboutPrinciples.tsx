import { aboutPageCopy } from "@/constants/aboutPageCopy";

export function AboutPrinciples() {
  return (
    <section
      id="our-approach"
      className="aboutPrinciples scroll-mt-header-compact mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="about-principles-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {aboutPageCopy.principlesEyebrow}
      </p>
      <h2
        id="about-principles-heading"
        className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {aboutPageCopy.principlesHeading}
      </h2>
      <ul className="mt-12 grid list-none gap-8 p-0 md:grid-cols-3">
        {aboutPageCopy.principles.map((principle) => (
          <li
            key={principle.id}
            className="aboutPrincipleCard border-t border-line pt-6"
          >
            <p className="text-meta uppercase tracking-[0.18em] text-accent">
              {principle.id} — {principle.title}
            </p>
            <h3 className="mt-4 text-h3 font-medium tracking-tight text-ink">
              {principle.subtitle}
            </h3>
            <p className="mt-4 text-body leading-8 text-ink-soft">
              {principle.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
