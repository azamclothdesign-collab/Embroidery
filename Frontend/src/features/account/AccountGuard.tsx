"use client";

import { type ReactNode } from "react";

import { AuthRequired } from "@/components/AuthRequired";
import {
  useCustomerSession,
  useCustomerSessionReady,
} from "@/hooks/useCustomerSession";

type AccountGuardProps = {
  locale: string;
  children: ReactNode;
};

export function AccountGuard({ locale, children }: AccountGuardProps) {
  const session = useCustomerSession();
  const isReady = useCustomerSessionReady();

  if (!isReady) {
    return <p className="text-body text-ink-soft">Loading account…</p>;
  }

  if (session === null) {
    return <AuthRequired locale={locale} />;
  }

  return children;
}
