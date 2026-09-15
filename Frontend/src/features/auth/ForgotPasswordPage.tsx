"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authCopy } from "@/constants/authCopy";
import { accountHref } from "@/constants/siteNavigation";
import { AuthPageShell } from "@/features/auth/AuthPageShell";
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";
import {
  useCustomerSession,
  useCustomerSessionReady,
} from "@/hooks/useCustomerSession";

type ForgotPasswordPageProps = {
  locale: string;
};

export function ForgotPasswordPage({ locale }: ForgotPasswordPageProps) {
  const router = useRouter();
  const session = useCustomerSession();
  const isReady = useCustomerSessionReady();

  useEffect(() => {
    if (isReady && session !== null) {
      router.replace(`/${locale}${accountHref}`);
    }
  }, [isReady, locale, router, session]);

  if (session !== null) {
    return null;
  }

  return (
    <AuthPageShell
      eyebrow={authCopy.forgotEyebrow}
      heading={authCopy.forgotHeading}
      body={authCopy.forgotBody}
    >
      <ForgotPasswordForm locale={locale} />
    </AuthPageShell>
  );
}
