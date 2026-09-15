import { testimonials } from "@/constants/testimonials";

export function HomeTestimonials() {
  return (
    <section className="bg-surface" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <h2 id="testimonials-heading" className="sr-only">
          Testimonials
        </h2>
        <ul className="grid list-none grid-cols-1 gap-16 p-0 lg:grid-cols-3 lg:gap-12">
          {testimonials.map((testimonial) => (
            <li key={testimonial.name} className="border-t border-line pt-8">
              <blockquote>
                <p className="text-title-sm font-medium tracking-tight text-ink md:text-title-md lg:text-title-sm">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="mt-6 text-body leading-8 text-ink-soft">
                  {testimonial.support}
                </p>
                <footer className="mt-10">
                  <cite className="block text-body not-italic text-ink">
                    {testimonial.name}
                  </cite>
                  <p className="mt-2 text-meta uppercase tracking-[0.22em] text-accent">
                    {testimonial.attribution}
                  </p>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
