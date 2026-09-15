"use client";

import { useId } from "react";
import Link from "next/link";

import { CheckIcon } from "@/components/icons/CheckIcon";
import { LockIcon } from "@/components/icons/LockIcon";
import { TextButton } from "@/components/TextButton";
import { checkoutCopy, checkoutTrustItems } from "@/constants/checkoutCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import {
  licensingHref,
  privacyHref,
  termsHref,
} from "@/constants/siteNavigation";

export type CheckoutPayState = "idle" | "processing" | "failed";

type CheckoutActionsProps = {
  locale: string;
  totalCents: number;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  canPay: boolean;
  payState: CheckoutPayState;
  onPay: () => void;
};

export function CheckoutActions({
  locale,
  totalCents,
  termsAccepted,
  onTermsChange,
  canPay,
  payState,
  onPay,
}: CheckoutActionsProps) {
  const termsId = useId();
  const totalLabel = formatShopPrice(totalCents);
  const label =
    payState === "processing"
      ? checkoutCopy.processing
      : payState === "failed"
        ? checkoutCopy.paymentFailed
        : `${checkoutCopy.paySecurely} ${totalLabel} ${checkoutCopy.paySecurelySuffix}`;

  return (
    <section className="mt-12" aria-labelledby="checkout-pay-heading">
      <h2 id="checkout-pay-heading" className="sr-only">
        {checkoutCopy.paySecurely}
      </h2>
      <ul className="flex list-none flex-col gap-2 p-0 text-meta text-ink-soft">
        {checkoutTrustItems.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckIcon />
            {item}
          </li>
        ))}
      </ul>
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
          {checkoutCopy.termsLabel}{" "}
          <Link
            href={`/${locale}${termsHref}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            {checkoutCopy.terms}
          </Link>
          ,{" "}
          <Link
            href={`/${locale}${privacyHref}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            {checkoutCopy.privacy}
          </Link>
          ,{" "}
          <Link
            href={`/${locale}${licensingHref}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            {checkoutCopy.licensing}
          </Link>
          .
        </label>
      </div>
      {payState === "failed" ? (
        <div className="mt-6 border border-line bg-surface px-5 py-5">
          <p className="text-body font-medium text-ink">
            {checkoutCopy.paymentFailedHeading}
          </p>
          <p className="mt-2 text-meta leading-6 text-ink-soft">
            {checkoutCopy.paymentFailedBody}
          </p>
        </div>
      ) : null}
      <div className="mt-8">
        <TextButton
          className="h-[3.625rem] w-full min-h-[3.625rem]"
          disabled={!canPay || payState === "processing"}
          onClick={onPay}
        >
          {label}
        </TextButton>
      </div>
      <p className="mt-5 inline-flex items-start gap-2 text-meta leading-6 text-ink-soft">
        <LockIcon />
        <span>
          <span className="block uppercase tracking-[0.14em] text-ink">
            {checkoutCopy.securePayment}
          </span>
          {checkoutCopy.secureBody}
        </span>
      </p>
    </section>
  );
}
