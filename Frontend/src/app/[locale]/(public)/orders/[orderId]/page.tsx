import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { OrderDetailPage } from "@/features/account/OrderDetailPage";
import { fetchProducts } from "@/lib/api/productsApi";

const orderIdPattern = /^[A-Za-z0-9-]+$/;

function parseOrderId(orderId: string): string | null {
  if (orderId.length < 3 || orderId.length > 40 || !orderIdPattern.test(orderId)) {
    return null;
  }

  return orderId;
}

type OrderDetailRouteProps = {
  params: Promise<{ locale: string; orderId: string }>;
};

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderDetailRoute({
  params,
}: OrderDetailRouteProps) {
  const { locale, orderId } = await params;
  const parsed = parseOrderId(orderId);

  if (parsed === null) {
    notFound();
  }

  const products = await fetchProducts();

  return (
    <>
      <SiteHeader locale={locale} />
      <PageEnter>
        <OrderDetailPage
          locale={locale}
          orderId={parsed}
          hasCatalogProducts={products.length > 0}
        />
      </PageEnter>
    </>
  );
}
