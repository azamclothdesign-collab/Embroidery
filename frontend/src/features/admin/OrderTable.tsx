"use client";

import { deleteOrderAction } from "@/actions/admin";
import { NavRow } from "./NavRow";
import { RowActions } from "./RowActions";
import { StatusBadge, rupees, shortDate } from "./ui";

export type OrderRow = {
  number: string;
  status: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  totalMinor: number;
  createdAt: string;
  lines: Array<{ id: string }>;
};

export function OrderTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="px-4 py-3 text-start font-semibold">Order</th>
            <th className="px-3 py-3 text-start font-semibold">Customer</th>
            <th className="px-3 py-3 text-start font-semibold">Items</th>
            <th className="px-3 py-3 text-start font-semibold">Method</th>
            <th className="px-3 py-3 text-start font-semibold">Status</th>
            <th className="px-3 py-3 text-end font-semibold">Total</th>
            <th className="px-4 py-3 text-end font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const href = `/admin/orders/${order.number}`;
            return (
              <NavRow key={order.number} href={href}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-teal">{order.number}</p>
                  <p className="text-xs text-muted">{shortDate(order.createdAt)}</p>
                </td>
                <td className="px-3 py-3">
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-xs text-muted">{order.customerEmail}</p>
                </td>
                <td className="px-3 py-3">{order.lines.length}</td>
                <td className="px-3 py-3 capitalize">{order.paymentMethod}</td>
                <td className="px-3 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-3 py-3 text-end font-semibold">{rupees(order.totalMinor)}</td>
                <td className="px-4 py-3 text-end">
                  <RowActions
                    editHref={href}
                    editLabel={`Edit order ${order.number}`}
                    deleteLabel={`Delete order ${order.number}`}
                    deleteConfirmLabel="Confirm delete order"
                    onDelete={() => deleteOrderAction(order.number)}
                    successMessage="Order deleted"
                  />
                </td>
              </NavRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
