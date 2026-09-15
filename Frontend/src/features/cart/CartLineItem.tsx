"use client";

import { useRef } from "react";
import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { cartCopy } from "@/constants/cartCopy";
import { formatShopPrice, shopProductHref } from "@/constants/shopCatalog";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { type CartDisplayLine } from "@/lib/session/cartDisplay";

type CartLineItemProps = {
  locale: string;
  line: CartDisplayLine;
  onRemove: (slug: string) => void;
  onSaveForLater: (slug: string) => void;
};

export function CartLineItem({
  locale,
  line,
  onRemove,
  onSaveForLater,
}: CartLineItemProps) {
  const itemRef = useRef<HTMLLIElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  const animateOut = (then: () => void) => {
    const node = itemRef.current;

    if (node === null || reduceMotion) {
      then();
      return;
    }

    node.style.overflow = "hidden";
    node.style.transition =
      "opacity 0.38s cubic-bezier(0.22, 1, 0.36, 1), transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), max-height 0.38s cubic-bezier(0.22, 1, 0.36, 1), padding 0.38s cubic-bezier(0.22, 1, 0.36, 1)";
    node.style.maxHeight = `${node.getBoundingClientRect().height}px`;
    void node.offsetWidth;
    node.style.opacity = "0";
    node.style.transform = "translateX(-1.25rem)";
    node.style.maxHeight = "0";
    node.style.paddingTop = "0";
    node.style.paddingBottom = "0";
    window.setTimeout(then, 380);
  };

  return (
    <li
      ref={itemRef}
      className="cartLine overflow-hidden border-b border-line py-6"
    >
      <div className="flex gap-4 md:gap-6">
        <Link
          href={shopProductHref(locale, line.slug)}
          className="relative size-24 shrink-0 overflow-hidden bg-line md:size-28"
        >
          <CoverImage
            src={line.imageSrc}
            alt={line.imageAlt}
            sizes="112px"
            className="absolute inset-0 size-full max-w-none object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-6">
            <div className="min-w-0">
              <Link
                href={shopProductHref(locale, line.slug)}
                className="text-body font-medium tracking-tight text-ink"
              >
                {line.displayName}
              </Link>
              {line.formatsLabel.length > 0 ? (
                <p className="mt-1 text-meta uppercase tracking-[0.14em] text-ink-soft">
                  {line.formatsLabel}
                </p>
              ) : null}
              {line.sizeLabel.length > 0 ? (
                <p className="mt-1 text-meta text-ink-soft">{line.sizeLabel}</p>
              ) : null}
              <p className="mt-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                {cartCopy.instantDownload}
              </p>
              {!line.isAvailable ? (
                <p className="mt-2 text-meta text-ink-soft">
                  {cartCopy.somethingChangedBody}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 text-body font-medium text-ink">
              {formatShopPrice(line.priceCents)}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-meta uppercase tracking-[0.14em]">
            <button
              type="button"
              className="min-h-11 text-ink-soft hover:text-ink"
              onClick={() => {
                animateOut(() => {
                  onRemove(line.slug);
                });
              }}
            >
              {cartCopy.remove}
            </button>
            <button
              type="button"
              className="min-h-11 text-ink-soft hover:text-ink"
              onClick={() => {
                animateOut(() => {
                  onSaveForLater(line.slug);
                });
              }}
            >
              {cartCopy.saveForLater}
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
