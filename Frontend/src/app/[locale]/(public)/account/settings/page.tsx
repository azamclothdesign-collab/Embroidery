import { type Metadata } from "next";

import { AccountPageFrame } from "@/features/account/AccountPageFrame";
import { AccountSettingsPage } from "@/features/account/AccountSettingsPage";

type AccountSettingsRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Account Settings",
};

export default async function AccountSettingsRoute({
  params,
}: AccountSettingsRouteProps) {
  const { locale } = await params;

  return (
    <AccountPageFrame locale={locale} activeId="settings">
      <AccountSettingsPage locale={locale} />
    </AccountPageFrame>
  );
}
