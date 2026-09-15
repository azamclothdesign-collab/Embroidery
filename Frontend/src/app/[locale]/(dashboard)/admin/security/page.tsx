import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminSecurityPage } from "@/features/admin/security/AdminSecurityPage";
import { getAdminSession } from "@/lib/api/adminAuthApi";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.securityTitle} | Admin`,
  description: adminCopy.securityBody,
};

export default async function AdminSecurityRoute({ params }: RouteProps) {
  const { locale } = await params;
  const session = await getAdminSession().catch(() => null);

  return <AdminSecurityPage locale={locale} session={session} />;
}
