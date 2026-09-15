"use client";

import { type ReactNode, useCallback, useState } from "react";

import { type MachineSelection } from "@/constants/machineCompatibilityCatalog";
import { type ShopProduct } from "@/constants/shopCatalog";
import { MachineBrandDirectory } from "@/features/machineCompatibility/MachineBrandDirectory";
import { MachineCompatHero } from "@/features/machineCompatibility/MachineCompatHero";
import { MachineDownloadExplain } from "@/features/machineCompatibility/MachineDownloadExplain";
import { MachineFinalCta } from "@/features/machineCompatibility/MachineFinalCta";
import { MachineRelatedDesigns } from "@/features/machineCompatibility/MachineRelatedDesigns";

type MachineFinderControllerProps = {
  locale: string;
  products: readonly ShopProduct[];
  afterHero: ReactNode;
  mid: ReactNode;
};

export function MachineFinderController({
  locale,
  products,
  afterHero,
  mid,
}: MachineFinderControllerProps) {
  const [selection, setSelection] = useState<MachineSelection | null>(null);

  const onSelect = useCallback((next: MachineSelection) => {
    setSelection(next);
    window.requestAnimationFrame(() => {
      document.getElementById("machine-finder-result")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "nearest",
      });
    });
  }, []);

  const onClear = useCallback(() => {
    setSelection(null);
  }, []);

  return (
    <>
      <MachineCompatHero
        locale={locale}
        selection={selection}
        onSelect={onSelect}
        onClear={onClear}
      />
      {afterHero}
      <MachineBrandDirectory onSelect={onSelect} />
      <MachineDownloadExplain selection={selection} />
      {mid}
      <MachineRelatedDesigns
        locale={locale}
        products={products}
        selection={selection}
      />
      <MachineFinalCta locale={locale} selection={selection} />
    </>
  );
}
