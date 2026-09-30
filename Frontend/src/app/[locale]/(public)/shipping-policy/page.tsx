import { type Metadata } from "next";

import { shippingPageContent } from "@/constants/legalPages";
import { shippingPolicyHref } from "@/constants/siteNavigation";
import { LegalPage } from "@/features/legal/LegalPage";

type ShippingPolicyRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Shipping & Service Policy",
};

export default async function ShippingPolicyRoute({
  params,
}: ShippingPolicyRouteProps) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      content={shippingPageContent}
      currentHref={shippingPolicyHref}
    />
  );
}
