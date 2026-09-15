import { aboutPageCopy } from "@/constants/aboutPageCopy";

export function AboutExperience() {
  return (
    <section
      className="aboutReveal border-y border-line bg-surface"
      aria-labelledby="about-experience-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="about-experience-heading"
          className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {aboutPageCopy.experienceHeading}
        </h2>
        <p className="mt-8 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          “{aboutPageCopy.experienceQuote}”
        </p>
        <ol className="aboutChain mt-12 flex list-none flex-col gap-4 p-0 md:flex-row md:flex-wrap md:items-center md:gap-x-4">
          {aboutPageCopy.experienceChain.map((item, index) => (
            <li key={item} className="aboutChainItem flex items-center gap-4">
              <span className="text-meta uppercase tracking-[0.14em] text-ink">
                {item}
              </span>
              {index < aboutPageCopy.experienceChain.length - 1 ? (
                <>
                  <span className="hidden text-ink-soft md:inline" aria-hidden="true">
                    →
                  </span>
                  <span className="text-ink-soft md:hidden" aria-hidden="true">
                    ↓
                  </span>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
