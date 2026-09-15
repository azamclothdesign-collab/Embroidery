"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { adminLoginHref } from "@/constants/adminNav";
import {
  useAdminSession,
  useAdminSessionReady,
} from "@/hooks/useAdminSession";

type AdminAuthGuardProps = {
  locale: string;
  children: ReactNode;
};

export function AdminAuthGuard({ locale, children }: AdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAdminSession();
  const isReady = useAdminSessionReady();

  useEffect(() => {
    if (isReady && session === null) {
      const loginPath = `/${locale}${adminLoginHref}`;
      if (pathname !== loginPath) {
        const nextParam = encodeURIComponent(pathname);
        router.replace(`${loginPath}?next=${nextParam}`);
      }
    }
  }, [isReady, session, router, pathname, locale]);

  return <>{children}</>;
}
