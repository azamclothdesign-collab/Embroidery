import { type Metadata } from "next";

import { AccountOrdersPage } from "@/features/account/AccountOrdersPage";
import { AccountPageFrame } from "@/features/account/AccountPageFrame";

type AccountOrdersRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Order History",
};

export default async function AccountOrdersRoute({
  params,
}: AccountOrdersRouteProps) {
  const { locale } = await params;

  return (
    <AccountPageFrame locale={locale} activeId="orders">
      <AccountOrdersPage locale={locale} />
    </AccountPageFrame>
  );
}
