import { faqCopy } from "@/constants/faq";
import { HomeFaqAccordion } from "@/features/home/HomeFaqAccordion";

export function HomeFaq() {
  return (
    <section
      id="faq"
      className="scroll-mt-header-compact bg-paper"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-6 py-16 md:max-w-7xl md:py-24">
        <h2
          id="faq-heading"
          className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
        >
          {faqCopy.heading}
        </h2>
        <div className="max-w-3xl">
          <HomeFaqAccordion />
        </div>
      </div>
    </section>
  );
}
