import { type MachineSelection } from "@/constants/machineCompatibilityCatalog";
import { machineCompatibilityPageCopy } from "@/constants/machineCompatibilityPageCopy";
import { MachineFinder } from "@/features/machineCompatibility/MachineFinder";

type MachineCompatHeroProps = {
  locale: string;
  selection: MachineSelection | null;
  onSelect: (selection: MachineSelection) => void;
  onClear: () => void;
};

export function MachineCompatHero({
  locale,
  selection,
  onSelect,
  onClear,
}: MachineCompatHeroProps) {
  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-[85rem] px-6 pt-14 pb-12 md:pt-20 md:pb-16">
        <p className="machineHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
          {machineCompatibilityPageCopy.eyebrow}
        </p>
        <h1 className="machineHeroCopy mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md lg:text-title-lg">
          {machineCompatibilityPageCopy.heading}
        </h1>
        <p className="machineHeroCopy mt-6 max-w-2xl text-body leading-8 text-ink-soft">
          {machineCompatibilityPageCopy.body}
        </p>
        <div className="machineHeroCopy mt-10 max-w-3xl">
          <MachineFinder
            locale={locale}
            selection={selection}
            onSelect={onSelect}
            onClear={onClear}
          />
        </div>
      </div>
    </section>
  );
}
