import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminSettingsPage } from "@/features/admin/settings/AdminSettingsPage";
import { fetchSiteGlobal } from "@/lib/api/siteSettingsApi";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.settingsTitle} | Admin`,
  description: adminCopy.settingsBody,
};

export default async function AdminSettingsRoute({ params }: RouteProps) {
  const { locale } = await params;
  const initialSettings = await fetchSiteGlobal();

  return (
    <AdminSettingsPage locale={locale} initialSettings={initialSettings} />
  );
}
