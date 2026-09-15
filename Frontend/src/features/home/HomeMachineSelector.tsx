"use client";

import { useId, useState } from "react";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { TextLink } from "@/components/TextLink";
import {
  defaultMachineName,
  formatForMachine,
  machineCompatibilityCopy,
  machineFormats,
  type MachineName,
} from "@/constants/machineFormats";
import { shopDesignsHref } from "@/constants/siteNavigation";

type HomeMachineSelectorProps = {
  locale: string;
};

function isMachineName(value: string): value is MachineName {
  return machineFormats.some((item) => item.machine === value);
}

export function HomeMachineSelector({ locale }: HomeMachineSelectorProps) {
  const selectId = useId();
  const formatId = useId();
  const [machine, setMachine] = useState<MachineName>(defaultMachineName);
  const format = formatForMachine(machine);

  if (format === undefined) {
    return null;
  }

  return (
    <div className="mt-12 max-w-md border-t border-paper/20 pt-10">
      <label
        htmlFor={selectId}
        className="text-meta uppercase tracking-[0.22em] text-paper"
      >
        {machineCompatibilityCopy.selectLabel}
      </label>
      <div className="relative mt-4">
        <select
          id={selectId}
          name="machine"
          value={machine}
          aria-describedby={formatId}
          className="min-h-11 w-full appearance-none border border-paper bg-ink px-4 pr-12 text-body text-paper [color-scheme:dark]"
          onChange={(event) => {
            const nextMachine = event.target.value;

            if (isMachineName(nextMachine)) {
              setMachine(nextMachine);
            }
          }}
        >
          {machineFormats.map((item) => (
            <option key={item.machine} value={item.machine}>
              {item.machine}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-paper">
          <ChevronDownIcon />
        </span>
      </div>
      <p id={formatId} aria-live="polite" className="mt-10">
        <span className="block text-meta uppercase tracking-[0.22em] text-paper/70">
          {machineCompatibilityCopy.formatLabel}
        </span>
        <span className="mt-3 block text-title-sm font-medium tracking-tight text-paper md:text-title-md">
          {format}
        </span>
      </p>
      <TextLink
        href={`/${locale}${shopDesignsHref}?q=${encodeURIComponent(format)}`}
        tone="paper"
        className="mt-10"
      >
        {machineCompatibilityCopy.cta}
      </TextLink>
    </div>
  );
}
