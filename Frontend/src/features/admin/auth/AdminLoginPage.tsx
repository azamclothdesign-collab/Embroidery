"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageEnter } from "@/components/PageEnter";
import { adminAuthCopy } from "@/constants/adminAuthCopy";
import { AdminLoginForm } from "@/features/admin/auth/AdminLoginForm";
import {
  useAdminSession,
  useAdminSessionReady,
} from "@/hooks/useAdminSession";

type AdminLoginPageProps = {
  locale: string;
};

export function AdminLoginPage({ locale }: AdminLoginPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useAdminSession();
  const isReady = useAdminSessionReady();
  const nextParam = searchParams.get("next");
  const nextPath =
    nextParam !== null && nextParam.startsWith(`/${locale}`)
      ? nextParam
      : `/${locale}/admin`;

  useEffect(() => {
    if (isReady && session !== null) {
      router.replace(nextPath);
    }
  }, [isReady, nextPath, router, session]);

  if (session !== null) {
    return null;
  }

  return (
    <PageEnter>
      <section className="mx-auto flex w-full max-w-[85rem] flex-1 flex-col px-6 py-12 md:py-20">
          <div className="mx-auto w-full max-w-md">
            <p className="text-meta uppercase tracking-[0.22em] text-accent">
              {adminAuthCopy.loginEyebrow}
            </p>
            <h1 className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
              {adminAuthCopy.loginHeading}
            </h1>
            <p className="mt-4 text-body leading-8 text-ink-soft">
              {adminAuthCopy.loginBody}
            </p>
            <p className="mt-3 text-meta leading-6 text-ink-soft">
              {adminAuthCopy.deviceNote}
            </p>
            <div className="mt-10">
              <AdminLoginForm locale={locale} nextPath={nextPath} />
            </div>
          </div>
        </section>
      </PageEnter>
  );
}
