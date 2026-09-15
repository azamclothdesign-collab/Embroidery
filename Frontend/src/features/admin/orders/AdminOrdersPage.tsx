"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { CoverImage } from "@/components/CoverImage";
import { adminCopy } from "@/constants/adminCopy";
import { adminOrderDetailHref } from "@/constants/adminNav";
import { deleteOrderAction } from "@/server/actions/orderActions";
import { type OrderLine, type OrderRecord } from "@/types/api/order";

type AdminOrdersPageProps = {
  locale: string;
  orders: OrderRecord[];
};

const maxVisibleDesigns = 3;

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function OrderDesignPreview({ lines }: { lines: readonly OrderLine[] }) {
  const visible = lines.slice(0, maxVisibleDesigns);
  const hiddenCount = lines.length - visible.length;
  const primary = lines[0];

  if (primary === undefined) {
    return <span className="text-ink-soft">—</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex shrink-0 items-center">
        {visible.map((line, index) => (
          <div
            key={`${line.slug}-${index}`}
            title={line.displayName}
            className={`relative size-12 overflow-hidden border border-line bg-paper ${
              index === 0 ? "" : "-ml-2.5"
            }`}
            style={{ zIndex: visible.length - index }}
          >
            <CoverImage
              src={line.imageSrc}
              alt={line.imageAlt}
              sizes="48px"
              className="absolute inset-0 size-full max-w-none object-cover"
            />
          </div>
        ))}
        {hiddenCount > 0 ? (
          <span className="ml-2 text-meta text-ink-soft">
            +{hiddenCount} {adminCopy.ordersMoreDesigns}
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{primary.displayName}</p>
        {lines.length > 1 ? (
          <p className="mt-0.5 text-[0.75rem] text-ink-soft">
            {lines.length} {adminCopy.ordersDesignCount}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AdminOrdersPage({ locale, orders }: AdminOrdersPageProps) {
  const localeRoot = `/${locale}`;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (q.length === 0) {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        order.email.toLowerCase().includes(q) ||
        order.lines.some(
          (line) =>
            line.displayName.toLowerCase().includes(q) ||
            line.name.toLowerCase().includes(q) ||
            line.slug.toLowerCase().includes(q),
        ),
    );
  }, [orders, query]);

  const revenueCents = orders.reduce((sum, order) => sum + order.totalCents, 0);

  const runDelete = () => {
    if (deleteOrderId === null) {
      return;
    }

    const orderId = deleteOrderId;
    setDeleteOrderId(null);

    startTransition(async () => {
      const result = await deleteOrderAction(orderId);

      if (!result.ok) {
        setToast(result.error || adminCopy.ordersActionFailed);
        window.setTimeout(() => {
          setToast(null);
        }, 2400);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.ordersTitle}
        body={adminCopy.ordersBody}
        actions={
          <button
            type="button"
            disabled
            className="inline-flex min-h-11 items-center border border-line px-4 text-meta uppercase tracking-[0.14em] text-ink-soft opacity-70"
            title={adminCopy.ordersExportPending}
          >
            {adminCopy.ordersExport}
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={adminCopy.ordersKpiTotal}
          value={String(orders.length)}
          pending={false}
        />
        <AdminStatCard
          label={adminCopy.ordersKpiPaid}
          value={String(orders.length)}
          pending={false}
        />
        <AdminStatCard
          label={adminCopy.ordersKpiRefunded}
          value="0"
          pending={false}
        />
        <AdminStatCard
          label={adminCopy.ordersKpiRevenue}
          value={formatMoney(revenueCents)}
          pending={false}
        />
      </section>

      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder={adminCopy.ordersSearch}
          className="min-h-12 flex-1 border border-line bg-surface px-4 text-[0.9375rem]"
        />
        {["All status", "Payment", "Date", "Amount"].map((label) => (
          <button
            key={label}
            type="button"
            disabled
            className="inline-flex min-h-12 items-center border border-line px-4 text-meta uppercase tracking-[0.14em] text-ink-soft opacity-70"
            title={adminCopy.ordersFilterComingSoon}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState
          title={adminCopy.ordersTitle}
          body={adminCopy.ordersEmpty}
          action={
            <Link
              href={`${localeRoot}/admin`}
              className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] underline-offset-4 hover:underline"
            >
              {adminCopy.overviewTitle}
            </Link>
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface lg:block">
            <table className="w-full border-collapse text-left text-[0.875rem]">
              <thead className="border-b border-line text-meta uppercase tracking-[0.14em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.ordersColOrder}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.ordersColCustomer}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.ordersColItems}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.ordersColTotal}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.ordersColDate}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.ordersColActions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-4 font-medium text-ink">
                      <Link
                        href={`${localeRoot}${adminOrderDetailHref(order.id)}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-ink-soft">{order.email}</td>
                    <td className="px-4 py-4">
                      <OrderDesignPreview lines={order.lines} />
                    </td>
                    <td className="px-4 py-4">{formatMoney(order.totalCents)}</td>
                    <td className="px-4 py-4 text-ink-soft">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={isPending}
                        className="text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline disabled:opacity-60"
                        onClick={() => {
                          setDeleteOrderId(order.id);
                        }}
                      >
                        {adminCopy.ordersMenuDelete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex list-none flex-col gap-3 p-0 lg:hidden">
            {filtered.map((order) => (
              <li
                key={order.id}
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <Link
                  href={`${localeRoot}${adminOrderDetailHref(order.id)}`}
                  className="block"
                >
                  <OrderDesignPreview lines={order.lines} />
                  <p className="mt-3 font-medium text-ink">{order.id}</p>
                  <p className="mt-1 text-[0.8125rem] text-ink-soft">
                    {order.email}
                  </p>
                  <p className="mt-1 text-[0.8125rem] text-ink-soft">
                    {formatMoney(order.totalCents)} · {formatDate(order.createdAt)}
                  </p>
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  className="mt-3 text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline disabled:opacity-60"
                  onClick={() => {
                    setDeleteOrderId(order.id);
                  }}
                >
                  {adminCopy.ordersMenuDelete}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <AdminConfirmDialog
        open={deleteOrderId !== null}
        title={adminCopy.ordersConfirmDeleteTitle}
        body={adminCopy.ordersConfirmDeleteBody}
        confirmLabel={adminCopy.ordersConfirmDelete}
        onClose={() => {
          setDeleteOrderId(null);
        }}
        onConfirm={runDelete}
      />

      {toast === null ? null : (
        <p
          className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 border border-line bg-paper px-5 py-3 text-meta text-ink"
          role="status"
        >
          {toast}
        </p>
      )}
    </div>
  );
}
