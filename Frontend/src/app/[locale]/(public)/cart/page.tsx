import { type Metadata } from "next";

import { CartPage } from "@/features/cart/CartPage";

type CartRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Shopping Cart",
};

export default async function CartRoute({ params }: CartRouteProps) {
  const { locale } = await params;

  return <CartPage locale={locale} />;
}
