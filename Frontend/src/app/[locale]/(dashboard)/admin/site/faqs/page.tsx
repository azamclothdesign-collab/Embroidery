import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminSiteFaqsPage } from "@/features/admin/site/AdminSiteFaqsPage";
import { fetchSiteFaqs } from "@/lib/api/siteSettingsApi";
import { type SiteFaqsSettings } from "@/types/api/siteSettings";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.siteFaqTitle} | Admin`,
};

const emptyFaqs: SiteFaqsSettings = {
  items: [],
};

export default async function AdminSiteFaqsRoute({ params }: RouteProps) {
  const { locale } = await params;

  let initialSettings;

  try {
    initialSettings = await fetchSiteFaqs();
  } catch {
    initialSettings = emptyFaqs;
  }

  return (
    <AdminSiteFaqsPage locale={locale} initialSettings={initialSettings} />
  );
}
