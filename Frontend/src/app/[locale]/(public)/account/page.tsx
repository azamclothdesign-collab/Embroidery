import { type Metadata } from "next";

import { AccountOverviewPage } from "@/features/account/AccountOverviewPage";
import { AccountPageFrame } from "@/features/account/AccountPageFrame";

type AccountRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountRoute({ params }: AccountRouteProps) {
  const { locale } = await params;

  return (
    <AccountPageFrame locale={locale} activeId="overview">
      <AccountOverviewPage locale={locale} />
    </AccountPageFrame>
  );
}
