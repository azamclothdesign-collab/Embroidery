"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { HeaderIconCountBadge } from "@/components/HeaderIconCountBadge";
import { CartIcon } from "@/components/icons/CartIcon";
import { useCartLines } from "@/hooks/useCartLines";
import { cartAddedEventName } from "@/lib/session/cartSession";

type HeaderCartPulseProps = {
  href: string;
  className: string;
  overlay?: boolean;
};

export function HeaderCartPulse({
  href,
  className,
  overlay = false,
}: HeaderCartPulseProps) {
  const lines = useCartLines();
  const count = lines.length;
  const cartButtonRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const onAdded = () => {
      const button = cartButtonRef.current;

      if (button === null) {
        return;
      }

      button.classList.remove("header-cart-pulse");
      void button.offsetWidth;
      button.classList.add("header-cart-pulse");
    };

    window.addEventListener(cartAddedEventName, onAdded);

    return () => {
      window.removeEventListener(cartAddedEventName, onAdded);
    };
  }, []);

  return (
    <Link
      ref={cartButtonRef}
      href={href}
      className={className}
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
    >
      <span className="relative inline-flex">
        <CartIcon />
        <HeaderIconCountBadge count={count} overlay={overlay} />
      </span>
    </Link>
  );
}
