"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { TextLink } from "@/components/TextLink";
import { checkoutCopy } from "@/constants/checkoutCopy";
import {
  cartHref,
  orderSuccessPath,
  shopDesignsHref,
} from "@/constants/siteNavigation";
import {
  CheckoutActions,
  type CheckoutPayState,
} from "@/features/checkout/CheckoutActions";
import { CheckoutContact } from "@/features/checkout/CheckoutContact";
import { CheckoutHeader } from "@/features/checkout/CheckoutHeader";
import { CheckoutHeading } from "@/features/checkout/CheckoutHeading";
import { CheckoutPayment } from "@/features/checkout/CheckoutPayment";
import {
  type CheckoutOverlayPhase,
  CheckoutProcessingOverlay,
} from "@/features/checkout/CheckoutProcessingOverlay";
import { CheckoutProgress } from "@/features/checkout/CheckoutProgress";
import { CheckoutStickyBar } from "@/features/checkout/CheckoutStickyBar";
import { CheckoutSummary } from "@/features/checkout/CheckoutSummary";
import { useCartLines, useCartLinesReady } from "@/hooks/useCartLines";
import { notifyOrderHistoryUpdated } from "@/hooks/useOrderHistory";
import {
  cartHasValidationIssues,
  resolveCartDisplayLines,
} from "@/lib/session/cartDisplay";
import { cartSubtotalCents, notifyCartUpdated } from "@/lib/session/cartSession";
import { type LocalOrder, writeLocalOrder } from "@/lib/session/orderSession";
import { clearCartAction } from "@/server/actions/cartActions";
import { createOrderAction } from "@/server/actions/orderActions";

type CheckoutPageProps = {
  locale: string;
};

export function CheckoutPage({ locale }: CheckoutPageProps) {
  const router = useRouter();
  const lines = useCartLines();
  const cartReady = useCartLinesReady();
  const displayLines = useMemo(() => resolveCartDisplayLines(lines), [lines]);
  const subtotalCents = cartSubtotalCents(displayLines);
  const hasIssues = cartHasValidationIssues(displayLines);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactValid, setContactValid] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [discountCents, setDiscountCents] = useState(0);
  const [payState, setPayState] = useState<CheckoutPayState>("idle");
  const [overlayPhase, setOverlayPhase] = useState<CheckoutOverlayPhase>("hidden");
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const canPay =
    displayLines.length > 0 &&
    !hasIssues &&
    contactValid &&
    termsAccepted &&
    payState !== "processing";

  const onContactValid = useCallback((isValid: boolean) => {
    setContactValid(isValid);
  }, []);

  const onPay = () => {
    if (!canPay) {
      return;
    }

    setPayState("processing");
    setOverlayPhase("processing");

    window.setTimeout(() => {
      setOverlayPhase("confirmed");
      window.setTimeout(() => {
        setOverlayPhase("preparing");
        window.setTimeout(() => {
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
              return;
            }

            const order: LocalOrder = {
              id: result.order.id,
              email: result.order.email,
              contactName: result.order.contactName,
              phone: result.order.phone,
              createdAt: result.order.createdAt,
              totalCents: result.order.totalCents,
              discountCents: result.order.discountCents,
              lines: result.order.lines,
            };

            writeLocalOrder(order);
            await clearCartAction();
            notifyCartUpdated();
            notifyOrderHistoryUpdated();
            router.push(`/${locale}${orderSuccessPath(order.id)}`);
          });
        }, 700);
      }, 650);
    }, 900);
  };

  if (!cartReady) {
    return (
      <>
        <CheckoutHeader locale={locale} />
        <section className="mx-auto w-full max-w-xl px-6 py-20 text-center">
          <p className="text-body text-ink-soft">Loading checkout…</p>
        </section>
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <CheckoutHeader locale={locale} />
        <section className="mx-auto w-full max-w-xl px-6 py-20 text-center">
          <h1 className="text-title-sm font-medium tracking-tight text-ink">
            {checkoutCopy.emptyHeading}
          </h1>
          <p className="mt-4 text-body leading-8 text-ink-soft">
            {checkoutCopy.emptyBody}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <TextLink href={`/${locale}${cartHref}`}>
              {checkoutCopy.returnToCart}
            </TextLink>
            <TextLink href={`/${locale}${shopDesignsHref}`} tone="ghostOnLight">
              {checkoutCopy.returnToShop}
            </TextLink>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <CheckoutHeader locale={locale} />
      <CheckoutProgress />
      <CheckoutHeading />
      <div className="mx-auto grid w-full max-w-[85rem] gap-10 px-6 pb-28 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)] lg:gap-14 lg:pb-20">
        <div className="checkoutForm">
          <CheckoutContact
            locale={locale}
            contactName={contactName}
            email={email}
            phone={phone}
            onContactNameChange={setContactName}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            onValidityChange={onContactValid}
          />
          <CheckoutPayment />
          <div id="checkout-actions">
            <CheckoutActions
              locale={locale}
              totalCents={totalCents}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
              canPay={canPay}
              payState={payState}
              onPay={onPay}
            />
          </div>
        </div>
        <CheckoutSummary
          locale={locale}
          lines={displayLines}
          subtotalCents={subtotalCents}
          discountCents={discountCents}
          onDiscountChange={setDiscountCents}
        />
      </div>
      <CheckoutStickyBar
        totalCents={totalCents}
        canPay={canPay}
        payState={payState}
        onPay={onPay}
      />
      <CheckoutProcessingOverlay phase={overlayPhase} />
    </>
  );
}
