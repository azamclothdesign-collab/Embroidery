"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authCopy } from "@/constants/authCopy";
import { accountHref } from "@/constants/siteNavigation";
import { AuthPageShell } from "@/features/auth/AuthPageShell";
import { RegisterForm } from "@/features/auth/RegisterForm";
import {
  useCustomerSession,
  useCustomerSessionReady,
} from "@/hooks/useCustomerSession";

type RegisterPageProps = {
  locale: string;
};

export function RegisterPage({ locale }: RegisterPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useCustomerSession();
  const isReady = useCustomerSessionReady();
  const nextParam = searchParams.get("next");
  const nextPath =
    nextParam !== null && nextParam.startsWith(`/${locale}`)
      ? nextParam
      : `/${locale}${accountHref}`;

  useEffect(() => {
    if (isReady && session !== null) {
      router.replace(nextPath);
    }
  }, [isReady, nextPath, router, session]);

  if (session !== null) {
    return null;
  }

  return (
    <AuthPageShell
      eyebrow={authCopy.registerEyebrow}
      heading={authCopy.registerHeading}
      body={authCopy.registerBody}
    >
      <RegisterForm locale={locale} nextPath={nextPath} />
    </AuthPageShell>
  );
}
