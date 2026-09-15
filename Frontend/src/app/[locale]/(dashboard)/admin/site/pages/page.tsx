import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminSitePagesPage } from "@/features/admin/site/AdminSitePagesPage";
import { fetchSitePages } from "@/lib/api/siteSettingsApi";
import { type SitePagesSettings } from "@/types/api/siteSettings";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.sitePagesTitle} | Admin`,
};

const emptyPages: SitePagesSettings = {
  pages: [],
};

export default async function AdminSitePagesRoute({ params }: RouteProps) {
  const { locale } = await params;

  let initialSettings;

  try {
    initialSettings = await fetchSitePages();
  } catch {
    initialSettings = emptyPages;
  }

  return (
    <AdminSitePagesPage locale={locale} initialSettings={initialSettings} />
  );
}
