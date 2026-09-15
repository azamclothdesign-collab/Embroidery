import {
  machineCompatibilityFormatCards,
  machineCompatibilityPageCopy,
} from "@/constants/machineCompatibilityPageCopy";

export function MachineFormatExplainer() {
  return (
    <section
      className="machineFormatSection machineReveal border-y border-line bg-surface"
      aria-labelledby="machine-formats-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {machineCompatibilityPageCopy.formatsEyebrow}
        </p>
        <h2
          id="machine-formats-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {machineCompatibilityPageCopy.formatsHeading}
        </h2>
        <ul className="mt-12 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {machineCompatibilityFormatCards.map((card) => (
            <li key={card.format}>
              <article className="machineFormatCard h-full border border-line bg-paper p-6 transition-[border-color,transform] duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] hover:border-ink">
                <p className="text-title-sm font-medium tracking-tight text-ink">
                  {card.format}
                </p>
                <p className="mt-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                  {card.machine}
                </p>
                <p className="mt-6 text-body leading-8 text-ink-soft">{card.body}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
