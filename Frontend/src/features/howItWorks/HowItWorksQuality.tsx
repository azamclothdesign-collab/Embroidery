import {
  howItWorksPageCopy,
  howItWorksQualityPoints,
} from "@/constants/howItWorksPageCopy";

export function HowItWorksQuality() {
  return (
    <section
      className="hiwReveal border-y border-line bg-ink text-paper"
      aria-labelledby="hiw-quality-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {howItWorksPageCopy.qualityEyebrow}
        </p>
        <h2
          id="hiw-quality-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-paper md:text-title-md"
        >
          {howItWorksPageCopy.qualityHeading}
        </h2>
        <p className="mt-6 max-w-2xl text-body leading-8 text-paper/80">
          {howItWorksPageCopy.qualityBody}
        </p>
        <ul className="mt-12 grid list-none gap-10 p-0 md:grid-cols-3">
          {howItWorksQualityPoints.map((point) => (
            <li key={point.title}>
              <h3 className="text-h3 font-medium tracking-tight text-paper">
                {point.title}
              </h3>
              <p className="mt-3 text-body leading-8 text-paper/75">{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
