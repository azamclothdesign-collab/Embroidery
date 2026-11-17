import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { OrderControls, ProofReview } from "@/features/admin/OrderControls";
import { PageHeader, Panel, StatusBadge, rupees, shortDate } from "@/features/admin/ui";
import { ApiError } from "@/lib/api.server";

export const metadata: Metadata = { title: "Order" };

type Detail = {
  order: {
    number: string;
    status: string;
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    locale: string;
    subtotalMinor: number;
    discountMinor: number;
    totalMinor: number;
    couponCode: string | null;
    providerReference: string | null;
    providerTxnId: string | null;
    paidAt: string | null;
    createdAt: string;
    lines: Array<{ id: string; productSlug: string; name: { en: string }; priceMinor: number; packageName: string; downloadCount: number }>;
  };
  events: Array<{ provider: string; kind: string; verified: boolean; created_at: string }>;
  proofs: Array<{ id: string; status: string; transaction_ref: string; created_at: string }>;
};

export default async function OrderDetailPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  if (!/^EMB-[0-9A-Z]{10}$/.test(number)) notFound();
  const data = await adminApi<Detail>(`/v1/admin/orders/${number}`).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  });
  if (data === null) notFound();
  const { order, events, proofs } = data;

  return (
    <>
      <Link href="/admin/orders" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Orders
      </Link>
      <PageHeader title={order.number} description={`Placed ${shortDate(order.createdAt)}${order.paidAt ? ` · paid ${shortDate(order.paidAt)}` : ""}`} actions={<StatusBadge status={order.status} />} />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Actions first so Mark as paid is visible without scrolling on mobile */}
        <div className="space-y-6 xl:order-2">
          <Panel title="Update status">
            <OrderControls number={order.number} status={order.status} method={order.paymentMethod} />
          </Panel>
          <Panel title="Customer">
            <p className="font-semibold">{order.customerName}</p>
            <p className="mt-2 flex items-center gap-2 text-sm"><Mail className="size-4 text-muted" aria-hidden /><a href={`mailto:${order.customerEmail}`} className="link">{order.customerEmail}</a></p>
            <p className="mt-1 flex items-center gap-2 text-sm"><Phone className="size-4 text-muted" aria-hidden /><a href={`tel:${order.customerPhone}`} className="link">{order.customerPhone}</a></p>
            <p className="mt-2 text-xs text-muted">Language: {order.locale === "ur" ? "Urdu" : "English"}</p>
          </Panel>
          <Panel title="Payment">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Method</dt><dd className="font-semibold capitalize">{order.paymentMethod}</dd></div>
              {order.providerReference && <div className="flex justify-between gap-3"><dt className="text-muted">Reference</dt><dd className="truncate font-mono text-xs">{order.providerReference}</dd></div>}
              {order.providerTxnId && <div className="flex justify-between gap-3"><dt className="text-muted">Transaction</dt><dd className="truncate font-mono text-xs">{order.providerTxnId}</dd></div>}
            </dl>
          </Panel>
        </div>

        <div className="space-y-6 xl:order-1">
          <Panel title="Items">
            <ul className="divide-y divide-line">
              {order.lines.map((line) => (
                <li key={line.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link href={`/en/d/${line.productSlug}`} target="_blank" className="font-semibold hover:text-saffron-strong">{line.name.en}</Link>
                    <p className="truncate text-xs text-muted">{line.packageName} · downloaded {line.downloadCount}×</p>
                  </div>
                  <span className="font-semibold">{rupees(line.priceMinor)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{rupees(order.subtotalMinor)}</dd></div>
              {order.discountMinor > 0 && <div className="flex justify-between text-success"><dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt><dd>−{rupees(order.discountMinor)}</dd></div>}
              <div className="flex justify-between text-lg font-semibold"><dt>Total</dt><dd>{rupees(order.totalMinor)}</dd></div>
            </dl>
          </Panel>

          {proofs.length > 0 && (
            <Panel title="Bank transfer receipts">
              <ul className="grid gap-4 sm:grid-cols-2">
                {proofs.map((proof) => (
                  <li key={proof.id} className="rounded-xl border border-line p-3">
                    <a href={`/admin/files/proof/${proof.id}`} target="_blank" rel="noopener" className="block overflow-hidden rounded-lg bg-sand">
                      {/* Plain <img>: private, authenticated image that must not go through the public image loader. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/admin/files/proof/${proof.id}`} alt={`Receipt uploaded ${shortDate(proof.created_at)}`} className="max-h-72 w-full object-contain" loading="lazy" />
                    </a>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <StatusBadge status={proof.status} />
                      <span className="text-muted">{shortDate(proof.created_at)}</span>
                    </div>
                    {proof.transaction_ref && <p className="mt-1 text-sm">Ref: <span className="font-mono">{proof.transaction_ref}</span></p>}
                    {proof.status === "pending" && <div className="mt-3"><ProofReview number={order.number} proofId={proof.id} /></div>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Payment timeline">
            {events.length === 0 ? (
              <p className="text-sm text-ink-soft">No payment activity yet.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {events.map((event, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className={`size-2 rounded-full ${event.verified ? "bg-teal" : "bg-gold"}`} aria-hidden />
                    <span className="w-40 shrink-0 text-muted">{shortDate(event.created_at)}</span>
                    <span className="font-semibold capitalize">{event.kind.replaceAll("_", " ")}</span>
                    <span className="text-muted">· {event.provider}{event.verified ? "" : " (unverified)"}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
