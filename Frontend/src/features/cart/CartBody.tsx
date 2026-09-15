"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";
import Link from "next/link";

import { TextButton } from "@/components/TextButton";
import { WishlistPrompt } from "@/components/WishlistPrompt";
import { cartCopy } from "@/constants/cartCopy";
import { formatDesignCount } from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { CartEmpty } from "@/features/cart/CartEmpty";
import { CartLineItem } from "@/features/cart/CartLineItem";
import { CartStickyBar } from "@/features/cart/CartStickyBar";
import { CartSummary } from "@/features/cart/CartSummary";
import { CartToast } from "@/features/cart/CartToast";
import { useCartLines, useCartLinesReady } from "@/hooks/useCartLines";
import { applyWishlistSnapshot } from "@/hooks/useWishlistItems";
import {
  cartHasValidationIssues,
  resolveCartDisplayLines,
} from "@/lib/session/cartDisplay";
import {
  type CartLine,
  cartSubtotalCents,
  notifyCartUpdated,
} from "@/lib/session/cartSession";
import {
  addCartLineAction,
  removeCartLineAction,
  updateCartAction,
} from "@/server/actions/cartActions";
import { addWishlistItemAction } from "@/server/actions/wishlistActions";

type CartBodyProps = {
  locale: string;
  hero: ReactNode;
  explore: ReactNode;
  trust: ReactNode;
};

export function CartBody({ locale, hero, explore, trust }: CartBodyProps) {
  const lines = useCartLines();
  const cartReady = useCartLinesReady();
  const displayLines = useMemo(() => resolveCartDisplayLines(lines), [lines]);
  const subtotalCents = cartSubtotalCents(displayLines);
  const hasIssues = cartHasValidationIssues(displayLines);
  const [discountCents, setDiscountCents] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<string | undefined>(undefined);
  const [undoLine, setUndoLine] = useState<CartLine | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const canCheckout = displayLines.length > 0 && !hasIssues;

  const hideToast = useCallback(() => {
    setToastMessage(null);
    setToastAction(undefined);
    setUndoLine(null);
  }, []);

  if (!cartReady) {
    return (
      <section className="mx-auto w-full max-w-xl px-6 py-20 text-center">
        <p className="text-body text-ink-soft">Loading cart…</p>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <CartEmpty locale={locale} />
        {trust}
        <CartToast
          message={toastMessage}
          actionLabel={toastAction}
          onAction={
            undoLine === null
              ? undefined
              : () => {
                  void addCartLineAction(undoLine).then(() => {
                    notifyCartUpdated();
                    hideToast();
                  });
                }
          }
          onHide={hideToast}
        />
        <WishlistPrompt
          locale={locale}
          isOpen={isWishlistOpen}
          onClose={() => {
            setIsWishlistOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      {hero}
      {hasIssues ? (
        <div className="mx-auto w-full max-w-[85rem] px-6 pb-6">
          <div className="border border-line bg-surface px-6 py-6">
            <h2 className="text-h3 font-medium text-ink">
              {cartCopy.somethingChanged}
            </h2>
            <p className="mt-3 max-w-2xl text-body leading-8 text-ink-soft">
              {cartCopy.somethingChangedBody}
            </p>
            <div className="mt-6">
              <TextButton
                tone="ghostOnLight"
                onClick={() => {
                  void updateCartAction(
                    lines.filter((line) =>
                      displayLines.some(
                        (item) => item.slug === line.slug && item.isAvailable,
                      ),
                    ),
                  ).then(() => {
                    notifyCartUpdated();
                  });
                }}
              >
                {cartCopy.reviewCart}
              </TextButton>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mx-auto grid w-full max-w-[85rem] gap-10 px-6 pb-16 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.9fr)] lg:gap-12 lg:pb-24">
        <section aria-labelledby="cart-designs-heading">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
            <h2
              id="cart-designs-heading"
              className="text-meta uppercase tracking-[0.16em] text-ink-soft"
            >
              {cartCopy.yourDesigns}
            </h2>
            <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
              {formatDesignCount(displayLines.length)}
            </p>
          </div>
          <ul className="list-none p-0">
            {displayLines.map((line) => (
              <CartLineItem
                key={line.slug}
                locale={locale}
                line={line}
                onRemove={(slug) => {
                  const previous = lines.find((item) => item.slug === slug);

                  if (previous === undefined) {
                    return;
                  }

                  void removeCartLineAction(slug).then(() => {
                    notifyCartUpdated();
                    setUndoLine(previous);
                    setToastMessage(cartCopy.removedToast);
                    setToastAction(cartCopy.undo);
                    setDiscountCents(0);
                  });
                }}
                onSaveForLater={(slug) => {
                  void addWishlistItemAction(slug).then((wishlist) => {
                    applyWishlistSnapshot(wishlist);
                    void removeCartLineAction(slug).then(() => {
                      notifyCartUpdated();
                      setToastMessage(cartCopy.wishlistToast);
                      setToastAction(undefined);
                      setUndoLine(null);
                      setIsWishlistOpen(true);
                      setDiscountCents(0);
                    });
                  });
                }}
              />
            ))}
          </ul>
          <Link
            href={`/${locale}${shopDesignsHref}`}
            className="mt-8 inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] text-ink"
          >
            ← {cartCopy.continueShopping}
          </Link>
        </section>
        <CartSummary
          locale={locale}
          subtotalCents={subtotalCents}
          discountCents={discountCents}
          onDiscountChange={setDiscountCents}
          canCheckout={canCheckout}
        />
      </div>
      {explore}
      {trust}
      <CartStickyBar
        locale={locale}
        totalCents={totalCents}
        canCheckout={canCheckout}
      />
      <CartToast
        message={toastMessage}
        actionLabel={toastAction}
        onAction={
          undoLine === null
            ? undefined
            : () => {
                void addCartLineAction(undoLine).then(() => {
                  notifyCartUpdated();
                  hideToast();
                });
              }
        }
        onHide={hideToast}
      />
      <WishlistPrompt
        locale={locale}
        isOpen={isWishlistOpen}
        onClose={() => {
          setIsWishlistOpen(false);
        }}
      />
    </>
  );
}
