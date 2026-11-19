import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Clock, Download, XCircle } from "lucide-react";
import { BankProofForm, PayButton } from "@/features/orders/OrderActions";
import { Totals } from "@/features/checkout/CartView";
import { apiOrNull } from "@/lib/api.server";
import { cn } from "@/lib/cn";
import { formatDate, formatPrice } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getOrderToken } from "@/lib/session.server";
import { pick, type CustomerOrder } from "@/lib/types";

type Props = {
  params: Promise<{ locale: string; number: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = { robots: { index: false, follow: false } };

const BANK_FIELDS: Array<[string, { en: string; ur: string }]> = [
  ["bankName", { en: "Bank", ur: "بینک" }],
  ["accountTitle", { en: "Account title", ur: "اکاؤنٹ ٹائٹل" }],
  ["accountNumber", { en: "Account number", ur: "اکاؤنٹ نمبر" }],
  ["iban", { en: "IBAN", ur: "IBAN" }],
  ["branch", { en: "Branch", ur: "برانچ" }],
];

export default async function OrderPage({ params, searchParams }: Props) {
  const { locale, number } = await params;
  if (!isLocale(locale) || !/^EMB-[0-9A-Z]{10}$/.test(number)) notFound();
  const t = getDictionary(locale);
  const payment = (await searchParams).payment;
  const token = await getOrderToken(number);
  const order = token === null ? null : await apiOrNull<CustomerOrder>(`/v1/orders/${number}/view`, { method: "POST", body: { token } });

  if (order === null) {
    return (
      <div className="container-page max-w-xl py-16 text-center">
        <AlertTriangle className="mx-auto size-10 text-gold" aria-hidden />
        <h1 className="mt-4 text-3xl">{t.order.title} {number}</h1>
        <p className="mt-3 text-ink-soft">{t.order.noAccess}</p>
        <Link href={`/${locale}/track`} className="btn btn-primary mt-6">
          {t.order.noAccessCta}
        </Link>
      </div>
    );
  }

  const paid = order.status === "paid";
  const startFailed = payment === "start_failed";
  const note =
    payment === "review"
      ? t.order.reviewNote
      : startFailed
        ? t.order.startFailedNote
        : paid
          ? t.order.paidNote
          : order.status === "awaiting_verification"
            ? t.order.awaitingNote
            : order.status === "failed"
              ? t.order.failedNote
              : t.order.pendingNote;
  const tone = paid ? "success" : order.status === "failed" || order.status === "cancelled" ? "danger" : "waiting";
  const Icon = tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : Clock;
  const proof = order.bankProof;

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <p className="eyebrow">{t.order.title}</p>
      <h1 className="mt-1 text-3xl sm:text-4xl" dir="ltr">{order.number}</h1>
      <p className="mt-1 text-sm text-muted">
        {t.order.placed}: {formatDate(order.createdAt, locale)}
      </p>

      <div
        role="status"
        className={cn(
          "mt-6 flex items-start gap-3 rounded-[var(--radius-card)] p-5",
          tone === "success" && "bg-teal-soft text-teal",
          tone === "danger" && "bg-danger-soft text-danger",
          tone === "waiting" && "bg-gold-soft text-ink",
        )}
      >
        <Icon className="mt-0.5 size-6 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">{t.order.statuses[order.status]}</p>
          <p className="mt-0.5">{note}</p>
        </div>
      </div>

      {order.canPay && (
        <div className="mt-6">
          <PayButton
            number={order.number}
            label={order.status === "failed" || startFailed ? t.order.retry : t.order.payNow}
            redirecting={t.checkout.redirecting}
          />
        </div>
      )}

      {order.paymentMethod === "bank" && !paid && order.method !== null && (
        <section className="card mt-6 grid gap-8 p-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg">{t.order.bankTitle}</h2>
            <p className="mt-2 text-sm text-ink-soft">{pick(order.method.instructions, locale)}</p>
            <dl className="mt-4 space-y-2">
              {BANK_FIELDS.filter(([key]) => (order.method?.details[key] ?? "").length > 0).map(([key, label]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-dashed border-line pb-2">
                  <dt className="text-sm text-muted">{label[locale]}</dt>
                  <dd className="font-semibold" dir="ltr">{order.method?.details[key]}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 pt-1">
                <dt className="text-sm text-muted">{t.cart.total}</dt>
                <dd className="text-lg font-semibold">{formatPrice(order.totalMinor, locale)}</dd>
              </div>
            </dl>
          </div>
          <div>
            {proof?.status === "pending" ? (
              <p className="rounded-xl bg-teal-soft px-4 py-3 font-semibold text-teal">{t.order.bankPending}</p>
            ) : (
              <>
                {proof?.status === "rejected" && <p className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{t.order.bankRejected}</p>}
                <BankProofForm
                  action={`/${locale}/order/${order.number}/proof`}
                  labels={{ title: t.order.bankUpload, ref: t.order.bankRef, file: t.order.bankFile, send: t.order.bankSend, sent: t.order.bankSent }}
                />
              </>
            )}
          </div>
        </section>
      )}

      <section className="mt-8" aria-labelledby="items-title">
        <h2 id="items-title" className="mb-4 text-xl">
          {t.order.items}
        </h2>
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-paper">
          {order.lines.map((line) => (
            <li key={line.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {line.image !== null && <Image src={line.image} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{pick(line.name, locale)}</p>
                  <p className="text-sm text-ink-soft">{formatPrice(line.priceMinor, locale)}</p>
                </div>
              </div>
              {paid &&
                (line.downloadUrl !== null ? (
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <a href={line.downloadUrl} className="btn btn-primary" rel="nofollow">
                      <Download className="size-4" aria-hidden />
                      {t.order.download}
                    </a>
                    <span className="text-xs text-muted">{t.order.downloadsLeft(line.downloadsLeft)}</span>
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-danger">{t.order.limitReached}</span>
                ))}
            </li>
          ))}
        </ul>
        <div className="mt-4 ms-auto max-w-sm">
          <Totals quote={order} locale={locale} labels={{ subtotal: t.cart.subtotal, discount: t.cart.discount, total: t.cart.total }} />
        </div>
        <p className="mt-6 text-sm text-muted">{t.order.saveLink}</p>
      </section>
    </div>
  );
}
