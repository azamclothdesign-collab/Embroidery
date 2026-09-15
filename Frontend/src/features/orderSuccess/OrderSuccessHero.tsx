"use client";

import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import { type LocalOrder } from "@/lib/session/orderSession";

type OrderSuccessHeroProps = {
  order: LocalOrder;
};

export function OrderSuccessHero({ order }: OrderSuccessHeroProps) {
  const dateLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(order.createdAt));

  return (
    <section className="mx-auto w-full max-w-[85rem] px-6 pt-12 pb-10 text-center md:pt-16 md:pb-12">
      <div
        className="hero-copy-enter mx-auto flex size-16 items-center justify-center rounded-full border border-ink text-h3 text-ink"
        aria-hidden="true"
      >
        ✓
      </div>
      <div className="hero-copy-enter">
        <p className="mt-8 text-meta uppercase tracking-[0.22em] text-accent">
          {orderSuccessCopy.eyebrow}
        </p>
        <h1 className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md lg:text-title-lg">
          {orderSuccessCopy.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {orderSuccessCopy.body}
        </p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-6 text-meta uppercase tracking-[0.14em] text-ink">
          <li>✓ {orderSuccessCopy.paymentConfirmed}</li>
          <li>✓ {orderSuccessCopy.filesReady}</li>
        </ul>
        <p className="mt-8 text-meta uppercase tracking-[0.16em] text-ink-soft">
          #{order.id}
        </p>
        <p className="mt-2 text-meta text-ink-soft">{dateLabel}</p>
        <p className="mt-4 text-meta leading-6 text-ink-soft">
          {orderSuccessCopy.confirmationSent}
          <br />
          <span className="text-ink">{order.email}</span>
        </p>
        <p className="mt-2 text-meta text-ink-soft">
          {formatShopPrice(order.totalCents)}
        </p>
      </div>
    </section>
  );
}
