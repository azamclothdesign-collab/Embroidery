"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CheckIcon } from "@/components/icons/CheckIcon";
import { TextButton } from "@/components/TextButton";
import { cartCopy } from "@/constants/cartCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import { checkoutHref } from "@/constants/siteNavigation";
import { CartCoupon } from "@/features/cart/CartCoupon";

type CartSummaryProps = {
  locale: string;
  subtotalCents: number;
  discountCents: number;
  onDiscountChange: (discountCents: number) => void;
  canCheckout: boolean;
};

export function CartSummary({
  locale,
  subtotalCents,
  discountCents,
  onDiscountChange,
  canCheckout,
}: CartSummaryProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const totalCents = Math.max(0, subtotalCents - discountCents);

  return (
    <aside
      id="cart-summary"
      className="cartSummary border border-line bg-surface p-6 md:p-8"
    >
      <h2 className="text-meta uppercase tracking-[0.16em] text-ink-soft">
        {cartCopy.orderSummary}
      </h2>
      <dl className="mt-6 flex flex-col gap-3 text-body">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-soft">{cartCopy.subtotal}</dt>
          <dd className="text-ink">{formatShopPrice(subtotalCents)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-soft">{cartCopy.discount}</dt>
          <dd className="text-ink">
            {discountCents > 0
              ? `−${formatShopPrice(discountCents)}`
              : formatShopPrice(0)}
          </dd>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-line pt-4">
          <dt className="text-h3 font-medium text-ink">{cartCopy.total}</dt>
          <dd className="text-h3 font-medium text-ink">
            <span key={totalCents} className="hero-copy-enter inline-block">
              {formatShopPrice(totalCents)}
            </span>
          </dd>
        </div>
      </dl>
      <div className="mt-6">
        <CartCoupon onAppliedChange={onDiscountChange} />
      </div>
      <div className="mt-8">
        <TextButton
          className="h-[3.625rem] w-full min-h-[3.625rem]"
          disabled={!canCheckout || isLoading}
          onClick={() => {
            if (!canCheckout || isLoading) {
              return;
            }

            setIsLoading(true);
            window.setTimeout(() => {
              router.push(`/${locale}${checkoutHref}`);
            }, 700);
          }}
        >
          {isLoading ? cartCopy.checkoutLoading : `${cartCopy.checkout} →`}
        </TextButton>
      </div>
      <p className="mt-5 text-meta leading-6 text-ink-soft">{cartCopy.digitalNotice}</p>
      <ul className="mt-6 flex flex-col gap-2 text-meta text-ink-soft">
        <li className="flex items-center gap-2">
          <CheckIcon />
          {cartCopy.securePayment}
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon />
          {cartCopy.instantDelivery}
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon />
          {cartCopy.downloadAfter}
        </li>
      </ul>
      <div className="mt-8 border-t border-line pt-6">
        <p className="text-meta uppercase tracking-[0.14em] text-ink">
          {cartCopy.secureCheckout}
        </p>
        <p className="mt-2 text-meta leading-6 text-ink-soft">{cartCopy.secureBody}</p>
      </div>
    </aside>
  );
}
