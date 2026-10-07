import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminPaymentsPage } from "@/features/admin/settings/AdminPaymentsPage";
import { fetchSitePayments } from "@/lib/api/siteSettingsApi";
import { type SitePaymentsSettings } from "@/types/api/siteSettings";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.paymentsTitle} | Admin`,
  description: adminCopy.paymentsBody,
};

const emptyPayments: SitePaymentsSettings = {
  gatewayEnabled: false,
  provider: "payfast",
  mode: "sandbox",
  merchantId: "",
  securedKey: "",
  merchantName: "Designer",
  tokenUrl:
    "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/GetAccessToken",
  checkoutUrl:
    "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction",
  successPath: "/checkout/payfast/success",
  failurePath: "/checkout/payfast/failure",
  hasSecuredKey: false,
};

export default async function AdminPaymentsRoute({ params }: RouteProps) {
  const { locale } = await params;

  let initialSettings: SitePaymentsSettings;

  try {
    initialSettings = await fetchSitePayments();
  } catch {
    initialSettings = emptyPayments;
  }

  return (
    <AdminPaymentsPage locale={locale} initialSettings={initialSettings} />
  );
}
