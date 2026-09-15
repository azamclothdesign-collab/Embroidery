"use client";

import Link from "next/link";

import { TextLink } from "@/components/TextLink";
import { accountCopy } from "@/constants/accountCopy";
import { formatOrderDate, orderDetailHref } from "@/constants/accountNav";
import { formatShopPrice } from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { AccountGuard } from "@/features/account/AccountGuard";
import { AccountScrollMotion } from "@/features/account/AccountScrollMotion";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { useSyncSessionOrderToHistory } from "@/hooks/useSyncSessionOrderToHistory";

type AccountOrdersPageProps = {
  locale: string;
};

export function AccountOrdersPage({ locale }: AccountOrdersPageProps) {
  useSyncSessionOrderToHistory();
  const orders = useOrderHistory();

  return (
    <AccountGuard locale={locale}>
      <AccountScrollMotion>
        <p className="accountHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
          {accountCopy.ordersEyebrow}
        </p>
        <h1 className="accountHeroCopy mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {accountCopy.ordersHeading}
        </h1>
        <p className="accountHeroCopy mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {accountCopy.ordersBody}
        </p>

        {orders.length === 0 ? (
          <div className="accountCard mt-12 border border-line bg-surface px-6 py-10 text-center">
            <h2 className="text-h3 font-medium tracking-tight text-ink">
              {accountCopy.ordersEmptyHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-body leading-8 text-ink-soft">
              {accountCopy.ordersEmptyBody}
            </p>
            <div className="mt-8 flex justify-center">
              <TextLink href={`/${locale}${shopDesignsHref}`}>
                {accountCopy.overviewExplore}
              </TextLink>
            </div>
          </div>
        ) : (
          <ul className="mt-12 flex list-none flex-col gap-4 p-0">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/${locale}${orderDetailHref(order.id)}`}
                  className="accountCard flex flex-col gap-3 border border-line bg-surface px-5 py-6 transition-colors hover:border-ink sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-body font-medium text-ink">#{order.id}</p>
                    <p className="mt-2 text-meta text-ink-soft">
                      {formatOrderDate(order.createdAt)} · {order.lines.length}{" "}
                      {order.lines.length === 1
                        ? accountCopy.orderDetailDesignSingular
                        : accountCopy.orderDetailDesigns}{" "}
                      · {accountCopy.paid}
                    </p>
                  </div>
                  <p className="text-body text-ink">
                    {formatShopPrice(order.totalCents)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AccountScrollMotion>
    </AccountGuard>
  );
}
