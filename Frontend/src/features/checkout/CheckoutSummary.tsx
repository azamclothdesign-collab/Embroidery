"use client";

import { useState } from "react";
import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { checkoutCopy, checkoutIncludedItems } from "@/constants/checkoutCopy";
import { formatShopPrice, shopProductHref } from "@/constants/shopCatalog";
import { CheckoutPromo } from "@/features/checkout/CheckoutPromo";
import { type CartDisplayLine } from "@/lib/session/cartDisplay";

type CheckoutSummaryProps = {
  locale: string;
  lines: readonly CartDisplayLine[];
  subtotalCents: number;
  discountCents: number;
  onDiscountChange: (discountCents: number) => void;
};

export function CheckoutSummary({
  locale,
  lines,
  subtotalCents,
  discountCents,
  onDiscountChange,
}: CheckoutSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const totalLabel = formatShopPrice(totalCents);

  return (
    <aside className="checkoutSummary lg:sticky lg:top-8">
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between border border-line bg-surface px-5 text-left lg:hidden"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
      >
        <span className="text-meta uppercase tracking-[0.14em] text-ink">
          {checkoutCopy.yourOrder} · {totalLabel}
        </span>
        <span aria-hidden="true">{isOpen ? "˄" : "˅"}</span>
      </button>
      <div
        className={`collapse-panel lg:[grid-template-rows:1fr]${isOpen ? " is-open" : ""}`}
      >
        <div className="collapse-panel-inner">
          <div className="border border-t-0 border-line bg-surface p-6 lg:border-t lg:p-8">
            <h2 className="hidden text-meta uppercase tracking-[0.16em] text-ink-soft lg:block">
              {checkoutCopy.yourOrder}
            </h2>
            <ul className="mt-0 flex list-none flex-col gap-5 p-0 lg:mt-6">
              {lines.map((line) => (
                <li key={line.slug} className="flex gap-4">
                  <Link
                    href={shopProductHref(locale, line.slug)}
                    className="relative size-16 shrink-0 overflow-hidden bg-line"
                  >
                    <CoverImage
                      src={line.imageSrc}
                      alt={line.imageAlt}
                      sizes="64px"
                      className="absolute inset-0 size-full max-w-none object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-medium text-ink">{line.name}</p>
                    {line.formatsLabel.length > 0 ? (
                      <p className="mt-1 text-meta uppercase tracking-[0.14em] text-ink-soft">
                        {line.formatsLabel}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 text-body text-ink">
                    {formatShopPrice(line.priceCents)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-body">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{checkoutCopy.subtotal}</dt>
                <dd>{formatShopPrice(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">{checkoutCopy.discount}</dt>
                <dd>
                  {discountCents > 0
                    ? `−${formatShopPrice(discountCents)}`
                    : formatShopPrice(0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-line pt-4">
                <dt className="text-h3 font-medium">{checkoutCopy.total}</dt>
                <dd className="text-h3 font-medium">{totalLabel}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <CheckoutPromo onAppliedChange={onDiscountChange} />
            </div>
            <div className="mt-6 border border-line bg-paper px-5 py-5">
              <p className="text-meta uppercase tracking-[0.14em] text-ink">
                {checkoutCopy.digitalDownload}
              </p>
              <p className="mt-3 text-meta leading-6 text-ink-soft">
                {checkoutCopy.digitalBody}
              </p>
            </div>
            <div className="mt-6">
              <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                {checkoutCopy.includedHeading}
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-meta text-ink-soft">
                {checkoutIncludedItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
