"use client";

import { useCallback, useState } from "react";

import { MachineFinderTool } from "@/components/MachineFinderTool";
import { type MachineSelection } from "@/constants/machineCompatibilityCatalog";

type HowItWorksFinderIslandProps = {
  locale: string;
};

export function HowItWorksFinderIsland({ locale }: HowItWorksFinderIslandProps) {
  const [selection, setSelection] = useState<MachineSelection | null>(null);

  const onSelect = useCallback((next: MachineSelection) => {
    setSelection(next);
  }, []);

  const onClear = useCallback(() => {
    setSelection(null);
  }, []);

  return (
    <MachineFinderTool
      locale={locale}
      selection={selection}
      onSelect={onSelect}
      onClear={onClear}
      variant="compact"
      resultId="hiw-machine-finder-result"
      showDisclaimer={false}
    />
  );
}
