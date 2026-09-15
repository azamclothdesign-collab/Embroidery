import { type Metadata } from "next";

import { CheckoutPage } from "@/features/checkout/CheckoutPage";

type CheckoutRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Checkout",
};

export default async function CheckoutRoute({ params }: CheckoutRouteProps) {
  const { locale } = await params;

  return <CheckoutPage locale={locale} />;
}
