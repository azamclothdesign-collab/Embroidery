"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CoverImage } from "@/components/CoverImage";
import { adminCopy } from "@/constants/adminCopy";
import { deleteOrderAction } from "@/server/actions/orderActions";
import { type OrderRecord } from "@/types/api/order";

type AdminOrderDetailPageProps = {
  locale: string;
  orderId: string;
  order: OrderRecord | null;
};

function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function AdminOrderDetailPage({
  locale,
  orderId,
  order,
}: AdminOrderDetailPageProps) {
  const localeRoot = `/${locale}`;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [refundOpen, setRefundOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const runDelete = () => {
    setDeleteOpen(false);

    startTransition(async () => {
      const result = await deleteOrderAction(orderId);

      if (!result.ok) {
        setToast(result.error || adminCopy.ordersActionFailed);
        window.setTimeout(() => {
          setToast(null);
        }, 2400);
        return;
      }

      router.push(`${localeRoot}/admin/orders`);
      router.refresh();
    });
  };

  if (order === null) {
    return (
      <div className="flex flex-col gap-8">
        <AdminPageHeader
          title={`${adminCopy.orderDetailTitle} #${orderId}`}
          body={adminCopy.orderDetailPending}
          actions={
            <Link
              href={`${localeRoot}/admin/orders`}
              className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] underline-offset-4 hover:underline"
            >
              {adminCopy.orderDetailBack}
            </Link>
          }
        />
        <AdminEmptyState
          title={adminCopy.orderDetailTitle}
          body={adminCopy.ordersEmpty}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={`${adminCopy.orderDetailTitle} #${order.id}`}
        body={order.email}
        actions={
          <Link
            href={`${localeRoot}/admin/orders`}
            className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] underline-offset-4 hover:underline"
          >
            {adminCopy.orderDetailBack}
          </Link>
        }
      />

      {toast === null ? null : (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-[0.875rem] text-ink-soft">
          {toast}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {adminCopy.orderDetailCustomer}
          </h2>
          <p className="mt-4 text-[0.9375rem] text-ink">{order.email}</p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {adminCopy.orderDetailPayment}
          </h2>
          <p className="mt-4 text-[0.9375rem] text-ink">
            {formatMoney(order.totalCents)}
          </p>
          {order.discountCents > 0 ? (
            <p className="mt-2 text-[0.8125rem] text-ink-soft">
              Discount {formatMoney(order.discountCents)}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold tracking-tight">
            {adminCopy.orderDetailDesigns}
          </h2>
          <ul className="mt-4 flex list-none flex-col gap-3 p-0">
            {order.lines.map((line) => (
              <li
                key={`${line.slug}-${line.displayName}`}
                className="flex gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0"
              >
                <div className="relative size-16 overflow-hidden bg-paper">
                  <CoverImage
                    src={line.imageSrc}
                    alt={line.imageAlt}
                    sizes="64px"
                    className="absolute inset-0 size-full max-w-none object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{line.displayName}</p>
                  <p className="mt-1 text-[0.8125rem] text-ink-soft">
                    ZIP package · {formatMoney(line.priceCents)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {adminCopy.orderDetailDelivery}
          </h2>
          <p className="mt-4 text-[0.9375rem] text-ink-soft">
            {adminCopy.orderDetailDeliveryReady}
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {adminCopy.orderDetailDownloads}
          </h2>
          <p className="mt-4 text-[0.9375rem] text-ink-soft">
            {adminCopy.orderDetailDownloadsEmpty}
          </p>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex min-h-11 items-center border border-line px-5 text-meta uppercase tracking-[0.14em]"
          onClick={() => {
            setRefundOpen(true);
          }}
        >
          {adminCopy.orderDetailRefund}
        </button>
        <button
          type="button"
          disabled={isPending}
          className="inline-flex min-h-11 items-center border border-line px-5 text-meta uppercase tracking-[0.14em] disabled:opacity-60"
          onClick={() => {
            setDeleteOpen(true);
          }}
        >
          {adminCopy.orderDetailDelete}
        </button>
      </div>

      <AdminConfirmDialog
        open={refundOpen}
        title={adminCopy.orderDetailRefund}
        body={adminCopy.orderDetailRefundPending}
        confirmLabel={adminCopy.orderDetailRefundConfirm}
        pendingNote={adminCopy.orderDetailRefundPending}
        onClose={() => {
          setRefundOpen(false);
        }}
        onConfirm={() => {
          setRefundOpen(false);
          setToast(adminCopy.orderDetailRefundPending);
          window.setTimeout(() => {
            setToast(null);
          }, 2400);
        }}
      />

      <AdminConfirmDialog
        open={deleteOpen}
        title={adminCopy.ordersConfirmDeleteTitle}
        body={adminCopy.ordersConfirmDeleteBody}
        confirmLabel={adminCopy.ordersConfirmDelete}
        onClose={() => {
          setDeleteOpen(false);
        }}
        onConfirm={runDelete}
      />
    </div>
  );
}
