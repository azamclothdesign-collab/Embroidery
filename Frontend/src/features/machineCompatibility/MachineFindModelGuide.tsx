import {
  machineCompatibilityFindSteps,
  machineCompatibilityPageCopy,
} from "@/constants/machineCompatibilityPageCopy";

export function MachineFindModelGuide() {
  return (
    <section
      className="machineReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="find-model-heading"
    >
      <h2
        id="find-model-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {machineCompatibilityPageCopy.findModelHeading}
      </h2>
      <ol className="mt-12 grid list-none gap-10 p-0 md:grid-cols-3">
        {machineCompatibilityFindSteps.map((step) => (
          <li key={step.id}>
            <p className="text-meta uppercase tracking-[0.18em] text-accent">
              {step.id}
            </p>
            <h3 className="mt-3 text-h3 font-medium tracking-tight text-ink">
              {step.title}
            </h3>
            <p className="mt-3 text-body leading-8 text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
