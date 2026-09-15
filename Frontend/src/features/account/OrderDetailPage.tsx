"use client";

import { useState } from "react";
import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { accountCopy } from "@/constants/accountCopy";
import {
  accountOrdersHref,
  formatOrderDate,
} from "@/constants/accountNav";
import { featuredCategories } from "@/constants/featuredCategories";
import {
  formatShopPrice,
  shopCategoryHref,
} from "@/constants/shopCatalog";
import {
  contactHref,
  licensingHref,
  shopDesignsHref,
} from "@/constants/siteNavigation";
import { AccountScrollMotion } from "@/features/account/AccountScrollMotion";
import { OrderDetailDesignCard } from "@/features/account/OrderDetailDesignCard";
import { useOrderById } from "@/hooks/useOrderHistory";
import { useSyncSessionOrderToHistory } from "@/hooks/useSyncSessionOrderToHistory";

type OrderDetailPageProps = {
  locale: string;
  orderId: string;
  hasCatalogProducts: boolean;
};

export function OrderDetailPage({
  locale,
  orderId,
  hasCatalogProducts,
}: OrderDetailPageProps) {
  useSyncSessionOrderToHistory();
  const order = useOrderById(orderId);
  const [toast, setToast] = useState<string | null>(null);

  if (order === null) {
    return (
      <section className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center">
        <h1 className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {accountCopy.orderDetailMissingHeading}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-body leading-8 text-ink-soft">
          {accountCopy.orderDetailMissingBody}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <TextLink href={`/${locale}${accountOrdersHref}`}>
            {accountCopy.orderDetailBack}
          </TextLink>
          <TextLink href={`/${locale}${shopDesignsHref}`} tone="ghostOnLight">
            {accountCopy.overviewExplore}
          </TextLink>
        </div>
      </section>
    );
  }

  const subtotalCents = order.lines.reduce((sum, line) => sum + line.priceCents, 0);
  const itemLabel =
    order.lines.length === 1
      ? `1 ${accountCopy.orderDetailDesignSingular}`
      : `${order.lines.length} ${accountCopy.orderDetailDesigns}`;

  return (
    <>
      <AccountScrollMotion>
        <div className="mx-auto w-full max-w-[85rem] px-6 py-10 md:py-14">
            <Link
              href={`/${locale}${accountOrdersHref}`}
              className="accountHeroCopy inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] text-ink"
            >
              ← {accountCopy.orderDetailBack}
            </Link>
            <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="accountHeroCopy text-title-sm font-medium tracking-tight text-ink md:text-title-md">
                  Order #{order.id}
                </h1>
                <p className="accountHeroCopy mt-3 text-body text-ink-soft">
                  {formatOrderDate(order.createdAt)}
                </p>
              </div>
              <p className="accountHeroCopy text-meta uppercase tracking-[0.18em] text-accent">
                {accountCopy.orderDetailPaid} ✓
              </p>
            </div>

            <ol className="accountReveal mt-12 flex list-none flex-col gap-4 p-0 sm:flex-row sm:items-center sm:gap-0">
              {[
                accountCopy.orderDetailTimelinePurchased,
                accountCopy.orderDetailTimelinePayment,
                accountCopy.orderDetailTimelineReady,
              ].map((label, index) => (
                <li key={label} className="flex items-center gap-3 sm:flex-1">
                  <span className="flex size-8 items-center justify-center border border-ink text-meta text-ink">
                    ✓
                  </span>
                  <span className="text-meta uppercase tracking-[0.14em] text-ink">
                    {label}
                  </span>
                  {index < 2 ? (
                    <span
                      aria-hidden="true"
                      className="mx-4 hidden h-px flex-1 bg-line sm:block"
                    />
                  ) : null}
                </li>
              ))}
            </ol>

            <section className="mt-16" aria-labelledby="order-designs-heading">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2
                  id="order-designs-heading"
                  className="text-title-sm font-medium tracking-tight text-ink"
                >
                  {accountCopy.orderDetailYourDesigns}
                </h2>
              </div>
              <ul className="mt-8 flex list-none flex-col gap-6 p-0">
                {order.lines.map((line) => (
                  <li key={line.slug}>
                    <OrderDetailDesignCard
                      locale={locale}
                      orderId={order.id}
                      line={line}
                      onToast={(message) => {
                        setToast(message);
                        window.setTimeout(() => {
                          setToast(null);
                        }, 3200);
                      }}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              <section
                className="accountReveal border border-line bg-surface px-6 py-8"
                aria-labelledby="order-summary-heading"
              >
                <h2
                  id="order-summary-heading"
                  className="text-h3 font-medium tracking-tight text-ink"
                >
                  {accountCopy.orderDetailSummary}
                </h2>
                <dl className="mt-6 space-y-4 text-body">
                  <div className="flex justify-between gap-4 border-b border-line pb-3">
                    <dt className="text-ink-soft">Order</dt>
                    <dd className="text-ink">#{order.id}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-3">
                    <dt className="text-ink-soft">Date</dt>
                    <dd className="text-ink">{formatOrderDate(order.createdAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-3">
                    <dt className="text-ink-soft">Payment</dt>
                    <dd className="text-ink">{accountCopy.paid} ✓</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-3">
                    <dt className="text-ink-soft">Payment method</dt>
                    <dd className="max-w-[14rem] text-right text-ink-soft">
                      {accountCopy.orderDetailPaymentMethodPending}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-line pb-3">
                    <dt className="text-ink-soft">{accountCopy.orderDetailItems}</dt>
                    <dd className="text-ink">{itemLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-soft">{accountCopy.orderDetailTotal}</dt>
                    <dd className="text-ink">{formatShopPrice(order.totalCents)}</dd>
                  </div>
                </dl>
              </section>

              <section className="accountReveal border border-line bg-surface px-6 py-8">
                <h2 className="text-h3 font-medium tracking-tight text-ink">
                  {accountCopy.orderDetailLicenseHeading}
                </h2>
                <p className="mt-4 text-body leading-8 text-ink-soft">
                  {accountCopy.orderDetailLicenseBody}
                </p>
                <div className="mt-6">
                  <TextLink href={`/${locale}${licensingHref}`}>
                    {accountCopy.orderDetailViewLicense}
                  </TextLink>
                </div>
                <div className="mt-10 border-t border-line pt-8">
                  <h3 className="text-h3 font-medium tracking-tight text-ink">
                    {accountCopy.orderDetailReceipt}
                  </h3>
                  <dl className="mt-6 space-y-3 text-body">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink-soft">{accountCopy.orderDetailSubtotal}</dt>
                      <dd>{formatShopPrice(subtotalCents)}</dd>
                    </div>
                    {order.discountCents > 0 ? (
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-soft">
                          {accountCopy.orderDetailDiscount}
                        </dt>
                        <dd>-{formatShopPrice(order.discountCents)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4 border-t border-line pt-3">
                      <dt className="text-ink-soft">{accountCopy.orderDetailTotal}</dt>
                      <dd>{formatShopPrice(order.totalCents)}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            </div>

            <section className="accountReveal mt-14 border border-line bg-paper px-6 py-10 text-center">
              <h2 className="text-title-sm font-medium tracking-tight text-ink">
                {accountCopy.orderDetailSupportHeading}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-ink-soft">
                {accountCopy.orderDetailSupportBody}
              </p>
              <div className="mt-8 flex justify-center">
                <TextLink href={`/${locale}${contactHref}`}>
                  {accountCopy.orderDetailContact}
                </TextLink>
              </div>
            </section>

            <section className="accountReveal mt-16" aria-labelledby="order-explore-heading">
              <h2
                id="order-explore-heading"
                className="text-title-sm font-medium tracking-tight text-ink"
              >
                {accountCopy.orderDetailExplore}
              </h2>
              <ul className="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
                {featuredCategories.map((category) => (
                  <li key={category.query}>
                    <Link
                      href={shopCategoryHref(locale, category.query)}
                      className="group block border border-line"
                    >
                      <span className="relative block aspect-[4/3] overflow-hidden bg-line">
                        <CoverImage
                          src={category.imageSrc}
                          alt={category.imageAlt}
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                        />
                      </span>
                      <span className="block px-4 py-4 text-body font-medium text-ink">
                        {category.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {hasCatalogProducts ? (
                <div className="mt-8">
                  <TextLink href={`/${locale}${shopDesignsHref}`}>
                    {accountCopy.overviewExplore}
                  </TextLink>
                </div>
              ) : null}
            </section>
          </div>
        </AccountScrollMotion>
      {toast !== null ? (
        <p
          className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 border border-line bg-paper px-5 py-3 text-meta text-ink"
          role="status"
        >
          {toast}
        </p>
      ) : null}
    </>
  );
}
