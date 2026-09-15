import { type Metadata } from "next";

import { privacyPageContent } from "@/constants/legalPages";
import { privacyHref } from "@/constants/siteNavigation";
import { LegalPage } from "@/features/legal/LegalPage";

type PrivacyRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default async function PrivacyRoute({ params }: PrivacyRouteProps) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      content={privacyPageContent}
      currentHref={privacyHref}
    />
  );
}
