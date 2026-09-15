"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { TextButton } from "@/components/TextButton";
import { cartCopy } from "@/constants/cartCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import { checkoutHref } from "@/constants/siteNavigation";

type CartStickyBarProps = {
  locale: string;
  totalCents: number;
  canCheckout: boolean;
};

export function CartStickyBar({
  locale,
  totalCents,
  canCheckout,
}: CartStickyBarProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        <p className="text-body font-medium text-ink">
          {formatShopPrice(totalCents)}
        </p>
        <TextButton
          className="min-w-[10rem] flex-1"
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
          {isLoading ? cartCopy.checkoutLoading : `${cartCopy.progressCheckout} →`}
        </TextButton>
      </div>
    </div>
  );
}
