import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminOrdersPage } from "@/features/admin/orders/AdminOrdersPage";
import { fetchOrders } from "@/lib/api/ordersApi";
import { type OrderRecord } from "@/types/api/order";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.ordersTitle} | Admin`,
  description: adminCopy.ordersBody,
};

export default async function AdminOrdersRoute({ params }: RouteProps) {
  const { locale } = await params;

  let orders: OrderRecord[];

  try {
    orders = await fetchOrders();
  } catch {
    orders = [];
  }

  return <AdminOrdersPage locale={locale} orders={orders} />;
}
