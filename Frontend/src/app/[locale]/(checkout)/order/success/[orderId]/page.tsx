import { type Metadata } from "next";

import { OrderSuccessPage } from "@/features/orderSuccess/OrderSuccessPage";

type OrderSuccessByIdPageProps = {
  params: Promise<{ locale: string; orderId: string }>;
};

export const metadata: Metadata = {
  title: "Order Success",
};

export default async function OrderSuccessByIdPage({
  params,
}: OrderSuccessByIdPageProps) {
  const { locale, orderId } = await params;

  return <OrderSuccessPage locale={locale} orderId={orderId} />;
}
