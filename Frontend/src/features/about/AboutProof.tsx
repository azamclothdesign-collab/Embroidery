import { aboutPageCopy } from "@/constants/aboutPageCopy";

export function AboutProof() {
  return (
    <section
      className="aboutReveal border-y border-line bg-surface"
      aria-labelledby="about-proof-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="about-proof-heading"
          className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {aboutPageCopy.proofHeading}
        </h2>
        <p className="mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {aboutPageCopy.proofBody}
        </p>
      </div>
    </section>
  );
}
