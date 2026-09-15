import { type Metadata } from "next";

import { cookiePageContent } from "@/constants/legalPages";
import { cookiePolicyHref } from "@/constants/siteNavigation";
import { LegalPage } from "@/features/legal/LegalPage";

type CookiePolicyRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default async function CookiePolicyRoute({
  params,
}: CookiePolicyRouteProps) {
  const { locale } = await params;

  return (
    <LegalPage
      locale={locale}
      content={cookiePageContent}
      currentHref={cookiePolicyHref}
    />
  );
}
