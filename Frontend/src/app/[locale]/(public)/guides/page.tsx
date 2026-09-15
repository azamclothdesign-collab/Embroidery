import { type Metadata } from "next";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { guidesPageCopy } from "@/constants/guides";
import { GuidesHubPage } from "@/features/guides/GuidesHubPage";

type GuidesRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: guidesPageCopy.metaTitle,
  description: guidesPageCopy.metaDescription,
};

export default async function GuidesRoute({ params }: GuidesRouteProps) {
  const { locale } = await params;

  return (
    <>
      <SiteHeader />
      <PageEnter>
        <GuidesHubPage locale={locale} />
      </PageEnter>
    </>
  );
}
