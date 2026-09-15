import { impactStats } from "@/constants/impactStats";

export function HomeImpact() {
  return (
    <section className="bg-ink text-paper" aria-labelledby="impact-heading">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <h2 id="impact-heading" className="sr-only">
          Trust statistics
        </h2>
        <dl className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {impactStats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="mt-4 text-meta uppercase tracking-[0.22em] text-paper/70">
                {stat.label}
              </dt>
              <dd className="text-title-sm font-medium tracking-tight text-paper md:text-title-md">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
