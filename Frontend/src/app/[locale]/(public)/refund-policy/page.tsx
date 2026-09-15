import { type Metadata } from "next";

import { refundPageContent } from "@/constants/legalPages";
import { refundPolicyHref } from "@/constants/siteNavigation";
import { LegalPage } from "@/features/legal/LegalPage";

type RefundPolicyRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default async function RefundPolicyRoute({
  params,
}: RefundPolicyRouteProps) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      content={refundPageContent}
      currentHref={refundPolicyHref}
    />
  );
}
