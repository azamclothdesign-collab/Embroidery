"use client";

import { useRouter } from "next/navigation";
import { type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Table row that opens `href` when clicked anywhere except nested controls. */
export function NavRow({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const router = useRouter();
  const go = () => router.push(href);
  const interactive = (target: EventTarget | null) =>
    target instanceof Element && target.closest("a, button, input, label, [data-no-row-nav]") !== null;

  const onClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (interactive(event.target)) return;
    go();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    if (interactive(event.target)) return;
    event.preventDefault();
    go();
  };

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn("cursor-pointer border-b border-line last:border-0 hover:bg-sand/40 focus-visible:bg-sand/50 focus-visible:outline-none", className)}
    >
      {children}
    </tr>
  );
}
