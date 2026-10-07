"use client";

import { useId } from "react";
import Link from "next/link";

import { CheckIcon } from "@/components/icons/CheckIcon";
import { LockIcon } from "@/components/icons/LockIcon";
import { TextButton } from "@/components/TextButton";
import { cartCopy } from "@/constants/cartCopy";
import { checkoutCopy } from "@/constants/checkoutCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import {
  licensingHref,
  privacyHref,
  termsHref,
} from "@/constants/siteNavigation";
import { CartCoupon } from "@/features/cart/CartCoupon";
import { CheckoutContact } from "@/features/checkout/CheckoutContact";
import { type CheckoutPayState } from "@/features/checkout/CheckoutActions";

type CartSummaryProps = {
  locale: string;
  subtotalCents: number;
  discountCents: number;
  onDiscountChange: (discountCents: number) => void;
  canPay: boolean;
  payState: CheckoutPayState;
  onPay: () => void;
  contactName: string;
  email: string;
  phone: string;
  onContactNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onContactValidChange: (isValid: boolean) => void;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  gatewayReady: boolean;
  gatewayEnabled: boolean;
  payError: string | null;
};

export function CartSummary({
  locale,
  subtotalCents,
  discountCents,
  onDiscountChange,
  canPay,
  payState,
  onPay,
  contactName,
  email,
  phone,
  onContactNameChange,
  onEmailChange,
  onPhoneChange,
  onContactValidChange,
  termsAccepted,
  onTermsChange,
  gatewayReady,
  gatewayEnabled,
  payError,
}: CartSummaryProps) {
  const termsId = useId();
  const totalCents = Math.max(0, subtotalCents - discountCents);
  const totalLabel = formatShopPrice(totalCents);
  const label =
    payState === "processing"
      ? cartCopy.checkoutLoading
      : `${cartCopy.checkout} ${totalLabel} ${cartCopy.checkoutSecurely}`;

  return (
    <aside
      id="cart-summary"
      className="cartSummary border border-line bg-surface p-6 md:p-8"
    >
      <h2 className="text-meta uppercase tracking-[0.16em] text-ink-soft">
        {cartCopy.orderSummary}
      </h2>
      <dl className="mt-6 flex flex-col gap-3 text-body">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-soft">{cartCopy.subtotal}</dt>
          <dd className="text-ink">{formatShopPrice(subtotalCents)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-ink-soft">{cartCopy.discount}</dt>
          <dd className="text-ink">
            {discountCents > 0
              ? `−${formatShopPrice(discountCents)}`
              : formatShopPrice(0)}
          </dd>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-line pt-4">
          <dt className="text-h3 font-medium text-ink">{cartCopy.total}</dt>
          <dd className="text-h3 font-medium text-ink">
            <span key={totalCents} className="hero-copy-enter inline-block">
              {formatShopPrice(totalCents)}
            </span>
          </dd>
        </div>
      </dl>
      <div className="mt-6">
        <CartCoupon onAppliedChange={onDiscountChange} />
      </div>

      <div className="mt-8 border-t border-line pt-8">
        <CheckoutContact
          locale={locale}
          contactName={contactName}
          email={email}
          phone={phone}
          onContactNameChange={onContactNameChange}
          onEmailChange={onEmailChange}
          onPhoneChange={onPhoneChange}
          onValidityChange={onContactValidChange}
        />
      </div>

      <div className="mt-8 border-t border-line pt-8">
        <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
          {checkoutCopy.paymentMethod}
        </p>
        <p className="mt-3 text-body text-ink">{checkoutCopy.paymentPayFast}</p>
        {!gatewayReady ? (
          <p className="mt-3 text-meta leading-6 text-ink-soft">
            {checkoutCopy.paymentChecking}
          </p>
        ) : gatewayEnabled ? (
          <p className="mt-3 text-meta leading-6 text-ink-soft">
            {checkoutCopy.paymentPayFastBody}
          </p>
        ) : (
          <p className="mt-3 text-meta leading-6 text-ink-soft">
            {cartCopy.paymentGatewayOff}
          </p>
        )}
      </div>

      <div className="mt-8 flex items-start gap-3">
        <input
          id={termsId}
          type="checkbox"
          checked={termsAccepted}
          className="mt-1 size-4 accent-ink"
          onChange={(event) => {
            onTermsChange(event.target.checked);
          }}
        />
        <label htmlFor={termsId} className="text-meta leading-6 text-ink-soft">
          {cartCopy.termsLabel}{" "}
          <Link
            href={`/${locale}${termsHref}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            {cartCopy.terms}
          </Link>
          ,{" "}
          <Link
            href={`/${locale}${privacyHref}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            {cartCopy.privacy}
          </Link>
          ,{" "}
          <Link
            href={`/${locale}${licensingHref}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            {cartCopy.licensing}
          </Link>
          .
        </label>
      </div>

      {payError === null ? null : (
        <p className="mt-6 text-meta leading-6 text-ink-soft">{payError}</p>
      )}

      <div className="mt-8">
        <TextButton
          className="h-[3.625rem] w-full min-h-[3.625rem]"
          disabled={!canPay || payState === "processing"}
          onClick={onPay}
        >
          {label}
        </TextButton>
      </div>
      <p className="mt-5 text-meta leading-6 text-ink-soft">{cartCopy.digitalNotice}</p>
      <ul className="mt-6 flex flex-col gap-2 text-meta text-ink-soft">
        <li className="flex items-center gap-2">
          <CheckIcon />
          {cartCopy.securePayment}
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon />
          {cartCopy.instantDelivery}
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon />
          {cartCopy.downloadAfter}
        </li>
      </ul>
      <div className="mt-8 border-t border-line pt-6">
        <p className="inline-flex items-center gap-2 text-meta uppercase tracking-[0.14em] text-ink">
          <LockIcon />
          {cartCopy.secureCheckout}
        </p>
        <p className="mt-2 text-meta leading-6 text-ink-soft">{cartCopy.secureBody}</p>
      </div>
    </aside>
  );
}
