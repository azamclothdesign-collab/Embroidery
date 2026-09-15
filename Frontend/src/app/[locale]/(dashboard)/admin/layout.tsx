import { type ReactNode } from "react";
import { redirect } from "next/navigation";

import { adminLoginHref } from "@/constants/adminNav";
import { AdminDashboardLayout } from "@/features/admin/AdminDashboardLayout";
import { getAdminSessionAction } from "@/server/actions/adminAuthActions";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const session = await getAdminSessionAction();

  if (session === null) {
    redirect(`/${locale}${adminLoginHref}`);
  }

  return (
    <AdminDashboardLayout locale={locale}>{children}</AdminDashboardLayout>
  );
}
