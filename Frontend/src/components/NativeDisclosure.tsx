import { type ReactNode } from "react";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";

type NativeDisclosureProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function NativeDisclosure({
  title,
  children,
  defaultOpen = false,
}: NativeDisclosureProps) {
  return (
    <details className="group border-t border-line" open={defaultOpen || undefined}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-body text-ink [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 transition-transform group-open:rotate-180"
        >
          <ChevronDownIcon />
        </span>
      </summary>
      <div className="max-w-3xl pb-6 text-body leading-8 text-ink-soft">{children}</div>
    </details>
  );
}
