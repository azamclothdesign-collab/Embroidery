"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { TextButton } from "@/components/TextButton";
import { cartCopy } from "@/constants/cartCopy";
import { formatDesignCount } from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { CartEmpty } from "@/features/cart/CartEmpty";
import { CartLineItem } from "@/features/cart/CartLineItem";
import { CartSummary } from "@/features/cart/CartSummary";
import { CartToast } from "@/features/cart/CartToast";
import { type CheckoutPayState } from "@/features/checkout/CheckoutActions";
import {
  type CheckoutOverlayPhase,
  CheckoutProcessingOverlay,
} from "@/features/checkout/CheckoutProcessingOverlay";
import { useCartLines, useCartLinesReady } from "@/hooks/useCartLines";
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

type CartBodyProps = {
  locale: string;
};

export function CartBody({ locale }: CartBodyProps) {
  const lines = useCartLines();
  const cartReady = useCartLinesReady();
  const displayLines = useMemo(() => resolveCartDisplayLines(lines), [lines]);
  const totalCents = cartSubtotalCents(displayLines);
  const hasIssues = cartHasValidationIssues(displayLines);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [undoLine, setUndoLine] = useState<CartLine | null>(null);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactValid, setContactValid] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [payState, setPayState] = useState<CheckoutPayState>("idle");
  const [overlayPhase, setOverlayPhase] =
    useState<CheckoutOverlayPhase>("hidden");
  const [gatewayEnabled, setGatewayEnabled] = useState(false);
  const [gatewayReady, setGatewayReady] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const payDisabled =
    displayLines.length === 0 ||
    hasIssues ||
    !gatewayEnabled ||
    payState === "processing";

  const hideToast = useCallback(() => {
    setToastMessage(null);
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

  useEffect(() => {
    // Back from PayFast can restore this page from the bfcache mid-redirect.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setPayState("idle");
        setOverlayPhase("hidden");
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const failPayment = (message: string) => {
    setPayState("idle");
    setOverlayPhase("hidden");
    setPayError(message);
  };

  const onPay = () => {
    if (payDisabled) {
      return;
    }

    if (!contactValid || !termsAccepted) {
      setShowErrors(true);
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
      discountCents: 0,
    })
      .then(async (result) => {
        if (!result.ok) {
          failPayment(`${cartCopy.paymentFailedBody} (${result.error})`);
          return;
        }

        const init = await initPayFastPaymentAction({
          orderId: result.order.id,
          locale,
        });

        if (!init.ok) {
          failPayment(
            init.error === "gateway_disabled"
              ? cartCopy.paymentGatewayOff
              : `${cartCopy.paymentFailedBody} (${init.error})`,
          );
          return;
        }

        submitPayFastForm(init.checkout.checkoutUrl, init.checkout.fields);
      })
      .catch(() => {
        failPayment(cartCopy.paymentFailedBody);
      });
  };

  const onRemove = (slug: string) => {
    const previous = lines.find((item) => item.slug === slug);

    if (previous === undefined) {
      return;
    }

    void removeCartLineAction(slug).then(() => {
      notifyCartUpdated();
      setUndoLine(previous);
      setToastMessage(cartCopy.removedToast);
    });
  };

  const toast = (
    <CartToast
      message={toastMessage}
      actionLabel={undoLine === null ? undefined : cartCopy.undo}
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
  );

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
        {toast}
      </>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 pt-8 pb-16 md:pt-12 md:pb-20">
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <h1 className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
            {cartCopy.heading}
          </h1>
          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
            {formatDesignCount(displayLines.length)}
          </p>
        </div>

        {hasIssues ? (
          <div className="mt-6 border border-line bg-surface p-5" role="alert">
            <p className="text-body font-medium text-ink">
              {cartCopy.somethingChanged}
            </p>
            <p className="mt-2 text-meta leading-5 text-ink-soft">
              {cartCopy.somethingChangedBody}
            </p>
            <TextButton
              tone="ghostOnLight"
              className="mt-4"
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
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <section aria-label={cartCopy.yourDesigns}>
            <ul className="list-none p-0">
              {displayLines.map((line) => (
                <CartLineItem
                  key={line.slug}
                  locale={locale}
                  line={line}
                  onRemove={onRemove}
                />
              ))}
            </ul>
            <Link
              href={`/${locale}${shopDesignsHref}`}
              className="mt-4 inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] text-ink-soft hover:text-ink"
            >
              ← {cartCopy.continueShopping}
            </Link>
          </section>
          <CartSummary
            locale={locale}
            totalCents={totalCents}
            payDisabled={payDisabled}
            showErrors={showErrors}
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
      </div>
      {toast}
      <CheckoutProcessingOverlay phase={overlayPhase} />
    </>
  );
}
