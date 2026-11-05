"use client";

import { useId } from "react";
import Link from "next/link";

import { TextButton } from "@/components/TextButton";
import { cartCopy } from "@/constants/cartCopy";
import { checkoutCopy } from "@/constants/checkoutCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import {
  licensingHref,
  privacyHref,
  termsHref,
} from "@/constants/siteNavigation";
import { type CheckoutPayState } from "@/features/checkout/CheckoutActions";
import { CheckoutContact } from "@/features/checkout/CheckoutContact";

type CartSummaryProps = {
  locale: string;
  totalCents: number;
  payDisabled: boolean;
  showErrors: boolean;
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

const policyLinkClassName = "text-ink underline underline-offset-4";

export function CartSummary({
  locale,
  totalCents,
  payDisabled,
  showErrors,
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
  const totalLabel = formatShopPrice(totalCents);
  const payLabel =
    payState === "processing"
      ? cartCopy.checkoutLoading
      : `${cartCopy.checkout} ${totalLabel}`;
  const payNote = !gatewayReady
    ? checkoutCopy.paymentChecking
    : gatewayEnabled
      ? cartCopy.payFastNote
      : cartCopy.paymentGatewayOff;

  return (
    <aside
      id="cart-summary"
      className="border border-line bg-surface p-6 lg:mt-5 lg:self-start"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-meta uppercase tracking-[0.16em] text-ink-soft">
          {cartCopy.total}
        </h2>
        <p className="text-title-sm font-medium tracking-tight text-ink">
          {totalLabel}
        </p>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <CheckoutContact
          contactName={contactName}
          email={email}
          phone={phone}
          showAllErrors={showErrors}
          onContactNameChange={onContactNameChange}
          onEmailChange={onEmailChange}
          onPhoneChange={onPhoneChange}
          onValidityChange={onContactValidChange}
        />
      </div>

      <div className="mt-5 flex items-start gap-3">
        <input
          id={termsId}
          type="checkbox"
          checked={termsAccepted}
          className="mt-0.5 size-4 shrink-0 accent-ink"
          onChange={(event) => {
            onTermsChange(event.target.checked);
          }}
        />
        <label htmlFor={termsId} className="text-meta leading-5 text-ink-soft">
          {cartCopy.termsLead}{" "}
          <Link href={`/${locale}${termsHref}`} className={policyLinkClassName}>
            {cartCopy.terms}
          </Link>
          {", "}
          <Link href={`/${locale}${privacyHref}`} className={policyLinkClassName}>
            {cartCopy.privacy}
          </Link>
          {` ${cartCopy.and} `}
          <Link
            href={`/${locale}${licensingHref}`}
            className={policyLinkClassName}
          >
            {cartCopy.licensing}
          </Link>{" "}
          {cartCopy.termsTail}
        </label>
      </div>
      {showErrors && !termsAccepted ? (
        <p className="mt-1.5 pl-7 text-meta text-ink">{cartCopy.termsRequired}</p>
      ) : null}

      {payError === null ? null : (
        <p className="mt-5 text-meta leading-5 text-ink" role="alert">
          {payError}
        </p>
      )}

      <TextButton
        className="mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
        disabled={payDisabled}
        onClick={onPay}
      >
        {payLabel}
      </TextButton>
      <p className="mt-3 text-center text-meta leading-5 text-ink-soft">
        {payNote}
      </p>
    </aside>
  );
}
