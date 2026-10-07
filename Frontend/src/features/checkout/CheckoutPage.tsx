"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { TextLink } from "@/components/TextLink";
import { checkoutCopy } from "@/constants/checkoutCopy";
import {
  cartHref,
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
import {
  cartHasValidationIssues,
  resolveCartDisplayLines,
} from "@/lib/session/cartDisplay";
import { cartSubtotalCents } from "@/lib/session/cartSession";
import {
  createOrderAction,
  getPaymentGatewayStatusAction,
  initPayFastPaymentAction,
} from "@/server/actions/orderActions";

type CheckoutPageProps = {
  locale: string;
};

function submitPayFastForm(
  checkoutUrl: string,
  fields: Record<string, string>,
): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export function CheckoutPage({ locale }: CheckoutPageProps) {
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

  useEffect(() => {
    void getPaymentGatewayStatusAction().then((status) => {
      setGatewayEnabled(status.enabled);
      setGatewayReady(true);
    });
  }, []);

  const onContactValid = useCallback((isValid: boolean) => {
    setContactValid(isValid);
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
        setPayError(checkoutCopy.paymentFailedBody);
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
            ? checkoutCopy.paymentGatewayOff
            : checkoutCopy.paymentFailedBody,
        );
        return;
      }

      setOverlayPhase("confirmed");
      submitPayFastForm(init.checkout.checkoutUrl, init.checkout.fields);
    });
  };

  if (!cartReady) {
    return (
      <>
        <CheckoutHeader locale={locale} />
        <section className="mx-auto w-full max-w-xl px-6 py-20 text-center">
          <p className="text-body text-ink-soft">{checkoutCopy.processing}</p>
        </section>
      </>
    );
  }

  if (displayLines.length === 0) {
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
          <CheckoutPayment
            gatewayEnabled={gatewayEnabled}
            gatewayReady={gatewayReady}
          />
          {payError === null ? null : (
            <p className="mt-6 text-body text-ink-soft">{payError}</p>
          )}
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
