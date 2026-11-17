"use client";

import { NavRow } from "./NavRow";
import { StatusBadge, rupees, shortDate } from "./ui";

type Row = {
  number: string;
  customerName: string;
  totalMinor: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
};

export function RecentOrders({ orders }: { orders: Row[] }) {
  if (orders.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-ink-soft sm:px-6">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="text-start text-muted">
          <tr className="border-b border-line">
            <th className="px-5 py-2 text-start font-semibold sm:px-6">Order</th>
            <th className="px-3 py-2 text-start font-semibold">Customer</th>
            <th className="px-3 py-2 text-start font-semibold">Method</th>
            <th className="px-3 py-2 text-start font-semibold">Status</th>
            <th className="px-5 py-2 text-end font-semibold sm:px-6">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <NavRow key={order.number} href={`/admin/orders/${order.number}`} className="hover:bg-sand/50">
              <td className="px-5 py-3 sm:px-6">
                <p className="font-semibold text-teal">{order.number}</p>
                <p className="text-xs text-muted">{shortDate(order.createdAt)}</p>
              </td>
              <td className="px-3 py-3">{order.customerName}</td>
              <td className="px-3 py-3 capitalize">{order.paymentMethod}</td>
              <td className="px-3 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-5 py-3 text-end font-semibold sm:px-6">{rupees(order.totalMinor)}</td>
            </NavRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}
