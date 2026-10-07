"use client";

import { useEffect, useState } from "react";

import { TextButton } from "@/components/TextButton";
import { cartCopy } from "@/constants/cartCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import { type CheckoutPayState } from "@/features/checkout/CheckoutActions";

type CartStickyBarProps = {
  totalCents: number;
  canPay: boolean;
  payState: CheckoutPayState;
  onPay: () => void;
};

export function CartStickyBar({
  totalCents,
  canPay,
  payState,
  onPay,
}: CartStickyBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const totalLabel = formatShopPrice(totalCents);
  const label =
    payState === "processing"
      ? cartCopy.checkoutLoading
      : `${cartCopy.checkout} ${totalLabel}`;

  useEffect(() => {
    const target = document.getElementById("cart-summary");

    if (target === null) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry !== undefined && !entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`fade-rise fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[12px] md:hidden${isVisible ? " is-visible" : ""}`}
    >
      <div className="mx-auto flex w-full max-w-[85rem] items-center gap-4 px-6 py-3">
        <p className="text-body font-medium text-ink">{totalLabel}</p>
        <TextButton
          className="min-w-[10rem] flex-1"
          disabled={!canPay || payState === "processing"}
          onClick={onPay}
        >
          {label}
        </TextButton>
      </div>
    </div>
  );
}
