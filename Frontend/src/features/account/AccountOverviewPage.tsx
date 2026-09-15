"use client";

import Link from "next/link";

import { TextLink } from "@/components/TextLink";
import { accountCopy } from "@/constants/accountCopy";
import {
  accountDownloadsHref,
  accountOrdersHref,
  accountSettingsHref,
  formatOrderDate,
  orderDetailHref,
} from "@/constants/accountNav";
import { formatShopPrice } from "@/constants/shopCatalog";
import { shopDesignsHref, wishlistHref } from "@/constants/siteNavigation";
import { AccountGuard } from "@/features/account/AccountGuard";
import { AccountScrollMotion } from "@/features/account/AccountScrollMotion";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { useSyncSessionOrderToHistory } from "@/hooks/useSyncSessionOrderToHistory";

type AccountOverviewPageProps = {
  locale: string;
};

export function AccountOverviewPage({ locale }: AccountOverviewPageProps) {
  useSyncSessionOrderToHistory();
  const session = useCustomerSession();
  const orders = useOrderHistory();
  const recent = orders[0];
  const designCount = orders.reduce((sum, order) => sum + order.lines.length, 0);
  const welcomeName = session?.firstName?.trim() || session?.email || "";

  return (
    <AccountGuard locale={locale}>
      <AccountScrollMotion>
        <p className="accountHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
          {accountCopy.overviewEyebrow}
        </p>
        <h1 className="accountHeroCopy mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {welcomeName.length > 0
            ? `${accountCopy.overviewWelcomePrefix} ${welcomeName}`
            : accountCopy.overviewHeading}
        </h1>
        <p className="accountHeroCopy mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {accountCopy.overviewBody}
        </p>

        <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2">
          {[
            {
              href: `/${locale}${accountOrdersHref}`,
              label: accountCopy.overviewOrders,
              meta: `${orders.length} · ${designCount}`,
            },
            {
              href: `/${locale}${accountDownloadsHref}`,
              label: accountCopy.overviewDownloads,
              meta: String(designCount),
            },
            {
              href: `/${locale}${wishlistHref}`,
              label: accountCopy.overviewSaved,
              meta: "",
            },
            {
              href: `/${locale}${accountSettingsHref}`,
              label: accountCopy.overviewSettings,
              meta: "",
            },
          ].map((card) => (
            <li key={card.href}>
              <Link
                href={card.href}
                className="accountCard flex min-h-28 flex-col justify-between border border-line bg-surface p-5"
              >
                <span className="text-body font-medium text-ink">{card.label}</span>
                {card.meta.length > 0 ? (
                  <span className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                    {card.meta}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>

        <section className="accountReveal mt-14" aria-labelledby="account-recent-heading">
          <h2
            id="account-recent-heading"
            className="text-h3 font-medium tracking-tight text-ink"
          >
            {accountCopy.overviewRecent}
          </h2>
          {recent === undefined ? (
            <div className="mt-6 border border-line bg-surface px-5 py-6">
              <p className="text-body leading-8 text-ink-soft">
                {accountCopy.overviewEmptyOrders}
              </p>
              <div className="mt-6">
                <TextLink href={`/${locale}${shopDesignsHref}`}>
                  {accountCopy.overviewExplore}
                </TextLink>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-4 border border-line bg-surface px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-body font-medium text-ink">#{recent.id}</p>
                <p className="mt-2 text-meta text-ink-soft">
                  {formatOrderDate(recent.createdAt)} ·{" "}
                  {formatShopPrice(recent.totalCents)} · {accountCopy.paid}
                </p>
              </div>
              <TextLink href={`/${locale}${orderDetailHref(recent.id)}`}>
                {accountCopy.viewOrder}
              </TextLink>
            </div>
          )}
        </section>
      </AccountScrollMotion>
    </AccountGuard>
  );
}
