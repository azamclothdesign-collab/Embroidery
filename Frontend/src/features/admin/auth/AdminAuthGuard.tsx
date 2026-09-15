"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { adminLoginHref } from "@/constants/adminNav";
import {
  useAdminSession,
  useAdminSessionReady,
} from "@/hooks/useAdminSession";
import { useIsClient } from "@/hooks/useIsClient";

type AdminAuthGuardProps = {
  locale: string;
  children: ReactNode;
};

export function AdminAuthGuard({ locale, children }: AdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAdminSession();
  const isReady = useAdminSessionReady();
  const isClient = useIsClient();

  useEffect(() => {
    if (isClient && isReady && session === null) {
      const loginPath = `/${locale}${adminLoginHref}`;
      if (pathname !== loginPath) {
        const nextParam = encodeURIComponent(pathname);
        router.replace(`${loginPath}?next=${nextParam}`);
      }
    }
  }, [isClient, isReady, session, router, pathname, locale]);

  if (!isClient || !isReady || session === null) {
    return null;
  }

  return <>{children}</>;
}
