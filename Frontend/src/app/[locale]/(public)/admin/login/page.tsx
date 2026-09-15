import { Suspense } from "react";
import { type Metadata } from "next";

import { SiteHeader } from "@/components/SiteHeader";
import { AdminLoginPage } from "@/features/admin/auth/AdminLoginPage";

type AdminLoginRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Admin Login",
};

export default async function AdminLoginRoute({
  params,
}: AdminLoginRouteProps) {
  const { locale } = await params;

  return (
    <>
      <SiteHeader locale={locale} />
      <Suspense fallback={null}>
        <AdminLoginPage locale={locale} />
      </Suspense>
    </>
  );
}
