import type { Metadata } from "next";
import { adminApi } from "@/features/admin/adminApi";
import { ExportOrders } from "@/features/admin/ExportOrders";
import { ListFilters, Pager, readAdminParams } from "@/features/admin/ListFilters";
import { OrderTable, type OrderRow } from "@/features/admin/OrderTable";
import { EmptyState, PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Orders" };

const STATUSES = ["awaiting_verification", "pending_payment", "paid", "failed", "cancelled", "refunded"];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { one, page, q } = readAdminParams(await searchParams);
  const status = STATUSES.includes(one("status")) ? one("status") : "";
  const params = new URLSearchParams({ page: String(page), limit: "25" });
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const data = await adminApi<{ items: OrderRow[]; total: number; pages: number }>(`/v1/admin/orders?${params.toString()}`);

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${data.total} order${data.total === 1 ? "" : "s"} · click any row to open`}
        actions={<ExportOrders />}
      />
      <ListFilters
        action="/admin/orders"
        q={q}
        tabParam="status"
        activeTab={status}
        placeholder="Order no., email, name or phone"
        tabs={[
          { value: "", label: "All" },
          { value: "awaiting_verification", label: "To verify" },
          { value: "pending_payment", label: "Unpaid" },
          { value: "paid", label: "Paid" },
          { value: "failed", label: "Failed" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />
      {data.items.length === 0 ? <EmptyState title="No orders found" /> : <OrderTable orders={data.items} />}
      <Pager
        page={page}
        pages={data.pages}
        href={(p) => `/admin/orders?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), page: String(p) }).toString()}`}
      />
    </>
  );
}
