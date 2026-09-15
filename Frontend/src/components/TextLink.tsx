import { type ReactNode } from "react";
import Link from "next/link";

import { actionClassName } from "@/components/actionClassName";

type TextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: "ink" | "paper" | "ghostOnDark" | "ghostOnLight";
};

export function TextLink({ href, children, className, tone = "ink" }: TextLinkProps) {
  return (
    <Link className={actionClassName({ tone, className: className ?? null })} href={href}>
      {children}
    </Link>
  );
}
