import {
  machineCompatibilityPageCopy,
  machineCompatibilitySeoParagraphs,
} from "@/constants/machineCompatibilityPageCopy";

export function MachineSeoContent() {
  return (
    <section
      className="machineReveal border-y border-line bg-surface"
      aria-labelledby="seo-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="seo-heading"
          className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {machineCompatibilityPageCopy.seoHeading}
        </h2>
        <div className="mt-8 max-w-3xl space-y-6">
          {machineCompatibilitySeoParagraphs.map((paragraph) => (
            <p key={paragraph} className="text-body leading-8 text-ink-soft">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
