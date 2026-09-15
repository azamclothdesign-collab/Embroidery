import { type Metadata } from "next";

import { adminCopy } from "@/constants/adminCopy";
import { AdminOrderDetailPage } from "@/features/admin/orders/AdminOrderDetailPage";
import { fetchOrderById } from "@/lib/api/ordersApi";
import { type OrderRecord } from "@/types/api/order";

type RouteProps = {
  params: Promise<{ locale: string; orderId: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.orderDetailTitle} | Admin`,
};

export default async function AdminOrderDetailRoute({ params }: RouteProps) {
  const { locale, orderId } = await params;

  let order: OrderRecord | null;

  try {
    order = await fetchOrderById(orderId);
  } catch {
    order = null;
  }

  return (
    <AdminOrderDetailPage locale={locale} orderId={orderId} order={order} />
  );
}
