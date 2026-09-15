"use client";

import { useEffect, useState } from "react";

import { TextButton } from "@/components/TextButton";
import { checkoutCopy } from "@/constants/checkoutCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import { type CheckoutPayState } from "@/features/checkout/CheckoutActions";

type CheckoutStickyBarProps = {
  totalCents: number;
  canPay: boolean;
  payState: CheckoutPayState;
  onPay: () => void;
};

export function CheckoutStickyBar({
  totalCents,
  canPay,
  payState,
  onPay,
}: CheckoutStickyBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("checkout-actions");

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
      className={`fade-rise fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[12px] lg:hidden${isVisible ? " is-visible" : ""}`}
    >
      <div className="mx-auto flex w-full max-w-[85rem] items-center gap-4 px-6 py-3">
        <p className="text-body font-medium text-ink">
          {formatShopPrice(totalCents)}
        </p>
        <TextButton
          className="min-w-[10rem] flex-1"
          disabled={!canPay || payState === "processing"}
          onClick={onPay}
        >
          {payState === "processing"
            ? checkoutCopy.processing
            : `${checkoutCopy.paySecurely} ${checkoutCopy.paySecurelySuffix} →`}
        </TextButton>
      </div>
    </div>
  );
}
