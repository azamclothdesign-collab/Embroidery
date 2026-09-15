import { CheckIcon } from "@/components/icons/CheckIcon";
import {
  problemSolutionCopy,
  problemSolutionPoints,
  problemSolutionProblems,
} from "@/constants/problemSolution";

export function HomeProblemSolution() {
  return (
    <section
      className="bg-surface"
      aria-labelledby="problem-solution-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="text-meta uppercase tracking-[0.22em] text-ink-soft">
          {problemSolutionCopy.eyebrow}
        </p>
        <h2
          id="problem-solution-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
        >
          {problemSolutionCopy.heading}
        </h2>
        <ol className="mt-16 grid list-none grid-cols-1 gap-12 p-0 md:grid-cols-3 md:gap-10">
          {problemSolutionProblems.map((problem) => (
            <li key={problem.number} className="border-t border-line pt-8">
              <p className="text-meta uppercase tracking-[0.22em] text-accent">
                {problem.number}
              </p>
              <h3 className="mt-5 text-h3 font-medium tracking-tight text-ink">
                {problem.title}
              </h3>
              <p className="mt-4 text-body leading-8 text-ink-soft">
                {problem.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
      <div className="bg-ink text-paper">
        <ul className="mx-auto flex max-w-7xl list-none flex-col gap-5 px-6 py-10 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-8 md:gap-y-5 md:py-12">
          {problemSolutionPoints.map((point) => (
            <li key={point} className="flex items-center gap-3">
              <span className="text-accent">
                <CheckIcon />
              </span>
              <span className="text-meta uppercase tracking-[0.16em]">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
