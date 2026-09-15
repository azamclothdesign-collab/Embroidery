import { type Metadata } from "next";

import { termsPageContent } from "@/constants/legalPages";
import { termsHref } from "@/constants/siteNavigation";
import { LegalPage } from "@/features/legal/LegalPage";

type TermsRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default async function TermsRoute({ params }: TermsRouteProps) {
  const { locale } = await params;

  return (
    <LegalPage locale={locale} content={termsPageContent} currentHref={termsHref} />
  );
}
