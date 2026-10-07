"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
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
import { type CheckoutPayState } from "@/features/checkout/CheckoutActions";
import {
  type CheckoutOverlayPhase,
  CheckoutProcessingOverlay,
} from "@/features/checkout/CheckoutProcessingOverlay";
import { useCartLines, useCartLinesReady } from "@/hooks/useCartLines";
import { applyWishlistSnapshot } from "@/hooks/useWishlistItems";
import { submitPayFastForm } from "@/lib/payments/submitPayFastForm";
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
import {
  createOrderAction,
  getPaymentGatewayStatusAction,
  initPayFastPaymentAction,
} from "@/server/actions/orderActions";
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
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactValid, setContactValid] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [payState, setPayState] = useState<CheckoutPayState>("idle");
  const [overlayPhase, setOverlayPhase] =
    useState<CheckoutOverlayPhase>("hidden");
  const [gatewayEnabled, setGatewayEnabled] = useState(false);
  const [gatewayReady, setGatewayReady] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const canPay =
    displayLines.length > 0 &&
    !hasIssues &&
    contactValid &&
    termsAccepted &&
    gatewayEnabled &&
    payState !== "processing";

  const hideToast = useCallback(() => {
    setToastMessage(null);
    setToastAction(undefined);
    setUndoLine(null);
  }, []);

  const onContactValidChange = useCallback((isValid: boolean) => {
    setContactValid(isValid);
  }, []);

  useEffect(() => {
    void getPaymentGatewayStatusAction().then((status) => {
      setGatewayEnabled(status.enabled);
      setGatewayReady(true);
    });
  }, []);

  const onPay = () => {
    if (!canPay) {
      return;
    }

    setPayError(null);
    setPayState("processing");
    setOverlayPhase("processing");

    void createOrderAction({
      email: email.trim(),
      contactName: contactName.trim(),
      phone: phone.trim(),
      lines: displayLines.map((line) => ({
        slug: line.slug,
        pdpSlug: line.pdpSlug,
        name: line.name,
        priceCents: line.priceCents,
        imageSrc: line.imageSrc,
        imageAlt: line.imageAlt,
      })),
      totalCents,
      discountCents,
    }).then(async (result) => {
      if (!result.ok) {
        setPayState("idle");
        setOverlayPhase("hidden");
        setPayError(cartCopy.paymentFailedBody);
        return;
      }

      const init = await initPayFastPaymentAction({
        orderId: result.order.id,
        locale,
      });

      if (!init.ok) {
        setPayState("idle");
        setOverlayPhase("hidden");
        setPayError(
          init.error === "gateway_disabled"
            ? cartCopy.paymentGatewayOff
            : cartCopy.paymentFailedBody,
        );
        return;
      }

      setOverlayPhase("confirmed");
      submitPayFastForm(init.checkout.checkoutUrl, init.checkout.fields);
    });
  };

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
          canPay={canPay}
          payState={payState}
          onPay={onPay}
          contactName={contactName}
          email={email}
          phone={phone}
          onContactNameChange={setContactName}
          onEmailChange={setEmail}
          onPhoneChange={setPhone}
          onContactValidChange={onContactValidChange}
          termsAccepted={termsAccepted}
          onTermsChange={setTermsAccepted}
          gatewayReady={gatewayReady}
          gatewayEnabled={gatewayEnabled}
          payError={payError}
        />
      </div>
      {explore}
      {trust}
      <CartStickyBar
        totalCents={totalCents}
        canPay={canPay}
        payState={payState}
        onPay={onPay}
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
      <CheckoutProcessingOverlay phase={overlayPhase} />
    </>
  );
}
