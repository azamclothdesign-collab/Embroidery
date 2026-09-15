import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminSiteGlobalPage } from "@/features/admin/site/AdminSiteGlobalPage";
import { fetchSiteGlobal } from "@/lib/api/siteSettingsApi";
import { type SiteGlobalSettings } from "@/types/api/siteSettings";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.siteGlobalTitle} | Admin`,
};

const emptyGlobal: SiteGlobalSettings = {
  brandName: "",
  tagline: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  instagram: "",
  pinterest: "",
};

export default async function AdminSiteGlobalRoute({ params }: RouteProps) {
  const { locale } = await params;

  let initialSettings;

  try {
    initialSettings = await fetchSiteGlobal();
  } catch {
    initialSettings = emptyGlobal;
  }

  return (
    <AdminSiteGlobalPage locale={locale} initialSettings={initialSettings} />
  );
}
