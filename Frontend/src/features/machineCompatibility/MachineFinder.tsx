"use client";

import { MachineFinderTool } from "@/components/MachineFinderTool";
import { type MachineSelection } from "@/constants/machineCompatibilityCatalog";

type MachineFinderProps = {
  locale: string;
  selection: MachineSelection | null;
  onSelect: (selection: MachineSelection) => void;
  onClear: () => void;
};

export function MachineFinder({
  locale,
  selection,
  onSelect,
  onClear,
}: MachineFinderProps) {
  return (
    <MachineFinderTool
      locale={locale}
      selection={selection}
      onSelect={onSelect}
      onClear={onClear}
      variant="full"
      resultId="machine-finder-result"
      showDisclaimer
    />
  );
}
