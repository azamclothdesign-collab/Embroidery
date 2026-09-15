import { aboutPageCopy } from "@/constants/aboutPageCopy";
import { testimonials } from "@/constants/testimonials";

export function AboutProof() {
  const testimonial = testimonials[0];

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
        {testimonial !== undefined ? (
          <blockquote className="mt-12 max-w-3xl border-l border-accent pl-6">
            <p className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
              “{testimonial.quote}”
            </p>
            <p className="mt-4 text-body leading-8 text-ink-soft">
              {testimonial.support}
            </p>
            <footer className="mt-6 text-meta uppercase tracking-[0.14em] text-ink">
              — {testimonial.name}
            </footer>
          </blockquote>
        ) : null}
      </div>
    </section>
  );
}
