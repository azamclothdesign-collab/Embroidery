"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authCopy } from "@/constants/authCopy";
import { accountHref } from "@/constants/siteNavigation";
import { AuthPageShell } from "@/features/auth/AuthPageShell";
import { LoginForm } from "@/features/auth/LoginForm";
import {
  useCustomerSession,
  useCustomerSessionReady,
} from "@/hooks/useCustomerSession";

type LoginPageProps = {
  locale: string;
};

export function LoginPage({ locale }: LoginPageProps) {
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
      eyebrow={authCopy.loginEyebrow}
      heading={authCopy.loginHeading}
      body={authCopy.loginBody}
    >
      <LoginForm locale={locale} nextPath={nextPath} />
    </AuthPageShell>
  );
}
