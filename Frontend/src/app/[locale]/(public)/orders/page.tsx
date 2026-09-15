import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { accountOrdersHref } from "@/constants/siteNavigation";

type OrdersRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Orders",
};

export default async function OrdersRoute({ params }: OrdersRouteProps) {
  const { locale } = await params;
  redirect(`/${locale}${accountOrdersHref}`);
}
