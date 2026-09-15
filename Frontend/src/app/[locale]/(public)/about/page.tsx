import { type Metadata } from "next";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { aboutPageCopy } from "@/constants/aboutPageCopy";
import { AboutPage } from "@/features/about/AboutPage";

type AboutRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: aboutPageCopy.metaTitle,
  description: aboutPageCopy.metaDescription,
};

export default async function AboutRoute({ params }: AboutRouteProps) {
  const { locale } = await params;

  return (
    <>
      <SiteHeader />
      <PageEnter>
        <AboutPage locale={locale} />
      </PageEnter>
    </>
  );
}
