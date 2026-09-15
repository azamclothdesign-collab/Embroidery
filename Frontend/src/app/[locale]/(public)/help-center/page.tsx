import { type Metadata } from "next";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { HelpCenterPage } from "@/features/helpCenter/HelpCenterPage";

type HelpCenterRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Help Center",
};

export default async function HelpCenterRoute({ params }: HelpCenterRouteProps) {
  const { locale } = await params;

  return (
    <>
      <SiteHeader />
      <PageEnter>
        <HelpCenterPage locale={locale} />
      </PageEnter>
    </>
  );
}
