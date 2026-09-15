import { aboutPageCopy } from "@/constants/aboutPageCopy";

export function AboutQuality() {
  return (
    <section
      className="aboutReveal border-y border-line bg-surface"
      aria-labelledby="about-quality-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="about-quality-heading"
          className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {aboutPageCopy.qualityHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {aboutPageCopy.qualityBody}
        </p>
        <ol className="aboutChain mt-12 flex list-none flex-col gap-4 p-0 md:flex-row md:flex-wrap md:items-center md:gap-x-4 md:gap-y-3">
          {aboutPageCopy.qualityChain.map((item, index) => (
            <li key={item} className="aboutChainItem flex items-center gap-4">
              <span className="text-meta uppercase tracking-[0.16em] text-ink">
                {item}
              </span>
              {index < aboutPageCopy.qualityChain.length - 1 ? (
                <span className="hidden text-ink-soft md:inline" aria-hidden="true">
                  →
                </span>
              ) : null}
              {index < aboutPageCopy.qualityChain.length - 1 ? (
                <span className="text-ink-soft md:hidden" aria-hidden="true">
                  ↓
                </span>
              ) : null}
            </li>
          ))}
        </ol>

        <h3 className="mt-16 text-title-sm font-medium tracking-tight text-ink">
          {aboutPageCopy.digitizationHeading}
        </h3>
        <ul className="mt-10 grid list-none gap-8 p-0 md:grid-cols-3">
          {aboutPageCopy.digitizationAreas.map((area) => (
            <li key={area.title} className="border-t border-line pt-6">
              <h4 className="text-h3 font-medium tracking-tight text-ink">
                {area.title}
              </h4>
              <p className="mt-3 text-body leading-8 text-ink-soft">{area.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
