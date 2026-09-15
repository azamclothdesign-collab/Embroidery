import { type Metadata } from "next";

import { licensePageContent } from "@/constants/legalPages";
import { licensingHref } from "@/constants/siteNavigation";
import { LegalPage } from "@/features/legal/LegalPage";

type LicensingRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Licensing",
};

export default async function LicensingRoute({ params }: LicensingRouteProps) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      content={licensePageContent}
      currentHref={licensingHref}
    />
  );
}
