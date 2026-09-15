import { type Metadata } from "next";

import { OrderSuccessRedirect } from "@/features/orderSuccess/OrderSuccessRedirect";

type OrderSuccessIndexPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Order Success",
};

export default async function OrderSuccessIndexPage({
  params,
}: OrderSuccessIndexPageProps) {
  const { locale } = await params;

  return <OrderSuccessRedirect locale={locale} />;
}
