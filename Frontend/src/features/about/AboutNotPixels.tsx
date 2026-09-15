import { aboutPageCopy } from "@/constants/aboutPageCopy";

export function AboutNotPixels() {
  return (
    <section
      className="aboutReveal bg-ink text-paper"
      aria-labelledby="about-not-pixels-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-20 text-center md:py-28">
        <h2
          id="about-not-pixels-heading"
          className="text-title-sm font-medium tracking-tight text-paper md:text-title-md lg:text-title-lg"
        >
          {aboutPageCopy.notPixelsHeading}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-body leading-8 text-paper/80">
          {aboutPageCopy.notPixelsBody}
        </p>
        <ol className="aboutChain mx-auto mt-14 flex list-none flex-col items-center gap-4 p-0 md:flex-row md:justify-center md:gap-6">
          {aboutPageCopy.notPixelsChain.map((item, index) => (
            <li key={item} className="aboutChainItem flex flex-col items-center gap-4 md:flex-row">
              <span className="text-meta uppercase tracking-[0.18em] text-paper">
                {item}
              </span>
              {index < aboutPageCopy.notPixelsChain.length - 1 ? (
                <span className="text-paper/50" aria-hidden="true">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
