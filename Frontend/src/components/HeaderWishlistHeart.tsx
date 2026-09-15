"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { HeaderIconCountBadge } from "@/components/HeaderIconCountBadge";
import { HeartIcon } from "@/components/icons/HeartIcon";
import { useWishlistItems } from "@/hooks/useWishlistItems";

type HeaderWishlistHeartProps = {
  href: string;
  label: string;
  className: string;
  overlay?: boolean;
};

export function HeaderWishlistHeart({
  href,
  label,
  className,
  overlay = false,
}: HeaderWishlistHeartProps) {
  const items = useWishlistItems();
  const count = items.length;
  const previousCount = useRef(count);
  const hasLoaded = useRef(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const saved = count > 0;

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      previousCount.current = count;
      return;
    }

    const link = linkRef.current;

    if (link !== null && count > previousCount.current) {
      link.classList.remove("header-cart-pulse");
      void link.offsetWidth;
      link.classList.add("header-cart-pulse");
    }

    previousCount.current = count;
  }, [count]);

  return (
    <Link
      ref={linkRef}
      href={href}
      aria-label={saved ? `${label}, ${count} saved` : label}
      className={className}
    >
      <span className="relative inline-flex">
        <HeartIcon filled={saved} />
        <HeaderIconCountBadge count={count} overlay={overlay} />
      </span>
    </Link>
  );
}
