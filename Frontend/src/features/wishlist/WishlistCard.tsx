"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import { WishlistButton } from "@/components/WishlistButton";
import {
  formatShopPrice,
  productPackageLabel,
  shopCategoryChips,
  shopProductHref,
} from "@/constants/shopCatalog";
import { shopCopy } from "@/constants/shopCopy";
import { wishlistCopy } from "@/constants/wishlistCopy";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { notifyCartAdded, notifyCartUpdated } from "@/lib/session/cartSession";
import { type WishlistDisplayItem } from "@/lib/session/wishlistDisplay";
import { addCartLineAction } from "@/server/actions/cartActions";

type AddState = "idle" | "adding" | "added";

type WishlistCardProps = {
  locale: string;
  item: WishlistDisplayItem;
  onRemove: (slug: string) => void;
};

export function WishlistCard({ locale, item, onRemove }: WishlistCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [addState, setAddState] = useState<AddState>("idle");
  const product = item.product;

  const animateOut = (then: () => void) => {
    const node = cardRef.current;

    if (node === null || reduceMotion) {
      then();
      return;
    }

    node.style.overflow = "hidden";
    node.style.transition =
      "opacity 0.38s cubic-bezier(0.22, 1, 0.36, 1), transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), max-height 0.38s cubic-bezier(0.22, 1, 0.36, 1), margin 0.38s cubic-bezier(0.22, 1, 0.36, 1)";
    node.style.maxHeight = `${node.getBoundingClientRect().height}px`;
    void node.offsetWidth;
    node.style.opacity = "0";
    node.style.transform = "scale(0.96)";
    node.style.maxHeight = "0";
    node.style.marginBottom = "0";
    window.setTimeout(then, 380);
  };

  const handleRemove = () => {
    animateOut(() => {
      onRemove(item.slug);
    });
  };

  if (!item.available || product === null) {
    return (
      <article
        ref={cardRef}
        className="wishlistCard flex h-full flex-col overflow-hidden border border-line"
      >
        <div className="relative aspect-4/3 bg-line">
          <p className="absolute inset-0 flex items-center justify-center bg-ink/55 px-4 text-center text-meta uppercase tracking-[0.14em] text-paper">
            {wishlistCopy.unavailable}
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h2 className="text-body font-medium tracking-tight text-ink">{item.slug}</h2>
          <p className="text-body leading-7 text-ink-soft">
            {wishlistCopy.unavailableBody}
          </p>
          <button
            type="button"
            className="mt-auto min-h-11 self-start text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
            onClick={handleRemove}
          >
            {wishlistCopy.remove}
          </button>
        </div>
      </article>
    );
  }

  const designHref = shopProductHref(locale, product.slug);
  const categoryLabel =
    shopCategoryChips.find((chip) => chip.id === product.categoryId)?.label ??
    product.categoryId;
  const addLabel =
    addState === "adding"
      ? wishlistCopy.adding
      : addState === "added"
        ? wishlistCopy.added
        : wishlistCopy.addToCart;

  const onAdd = () => {
    if (addState !== "idle") {
      return;
    }

    setAddState("adding");
    window.setTimeout(() => {
      void addCartLineAction({
        slug: product.slug,
        pdpSlug: product.pdpSlug,
        name: product.name,
        priceCents: product.priceCents,
        imageSrc: product.imageSrc,
        imageAlt: product.imageAlt,
      }).then(() => {
        notifyCartUpdated();
        setAddState("added");
        notifyCartAdded({ openDrawer: true });
        window.setTimeout(() => {
          setAddState("idle");
        }, 1400);
      });
    }, 420);
  };

  return (
    <article
      ref={cardRef}
      className="wishlistCard group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-line">
        <p className="absolute top-3 left-3 z-20 bg-paper px-3 py-1 text-meta uppercase tracking-[0.14em] text-ink">
          {product.badge}
        </p>
        <WishlistButton
          name={product.name}
          slug={product.slug}
          onRemoved={handleRemove}
        />
        <Link href={designHref} aria-label={`View ${product.name} design`}>
          <CoverImage
            src={product.imageSrc}
            alt={product.imageAlt}
            sizes="(min-width: 1440px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-300 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03]"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-2 pt-3 md:pt-4">
        <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
          {categoryLabel}
        </p>
        <h2 className="text-body font-medium tracking-tight text-ink">
          <Link href={designHref}>{product.name}</Link>
        </h2>
        <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
          {productPackageLabel(product)}
        </p>
        <p className="text-body text-ink">{formatShopPrice(product.priceCents)}</p>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <TextButton
            className="w-full"
            disabled={addState !== "idle"}
            onClick={onAdd}
          >
            {addLabel}
          </TextButton>
          <TextLink href={designHref} tone="ghostOnLight" className="w-full">
            {shopCopy.viewDesign}
          </TextLink>
          <button
            type="button"
            className="min-h-11 text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
            onClick={handleRemove}
          >
            {wishlistCopy.remove}
          </button>
        </div>
      </div>
    </article>
  );
}
