import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminOverviewPage } from "@/features/admin/overview/AdminOverviewPage";
import { fetchOrders } from "@/lib/api/ordersApi";
import { fetchProductsFresh } from "@/lib/api/productsApi";

type AdminOverviewRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.overviewTitle} | Admin`,
  description: adminCopy.overviewBody,
};

export default async function AdminOverviewRoute({
  params,
}: AdminOverviewRouteProps) {
  const { locale } = await params;
  const [products, orders] = await Promise.all([
    fetchProductsFresh(),
    fetchOrders().catch(() => []),
  ]);

  return (
    <AdminOverviewPage locale={locale} products={products} orders={orders} />
  );
}
