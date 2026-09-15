import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminSiteHubPage } from "@/features/admin/site/AdminSiteHubPage";
import {
  fetchSiteGlobal,
  fetchSitePages,
} from "@/lib/api/siteSettingsApi";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.siteTitle} | Admin`,
  description: adminCopy.siteBody,
};

export default async function AdminSiteRoute({ params }: RouteProps) {
  const { locale } = await params;
  const [globalSettings, pagesSettings] = await Promise.all([
    fetchSiteGlobal().catch(() => null),
    fetchSitePages().catch(() => null),
  ]);

  return (
    <AdminSiteHubPage
      locale={locale}
      lastSyncedLabel={
        globalSettings === null
          ? adminCopy.siteHealthPublishedPending
          : adminCopy.sitePublishedNow
      }
      pages={pagesSettings?.pages ?? []}
    />
  );
}
