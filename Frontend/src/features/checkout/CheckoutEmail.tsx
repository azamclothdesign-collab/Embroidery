"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

import { checkoutCopy } from "@/constants/checkoutCopy";
import { accountLoginHref } from "@/constants/siteNavigation";
import { isValidEmail } from "@/schemas/authFormSchema";

type CheckoutEmailProps = {
  locale: string;
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
};

export function CheckoutEmail({
  locale,
  value,
  onChange,
  onValidityChange,
}: CheckoutEmailProps) {
  const inputId = useId();
  const hintId = useId();
  const [touched, setTouched] = useState(false);
  const isValid = isValidEmail(value);
  const showStatus = touched || value.length > 0;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  return (
    <section aria-labelledby="checkout-info-heading">
      <h2 id="checkout-info-heading" className="text-h3 font-medium text-ink">
        {checkoutCopy.yourInformation}
      </h2>
      <label
        htmlFor={inputId}
        className="mt-6 block text-meta uppercase tracking-[0.14em] text-ink-soft"
      >
        {checkoutCopy.emailLabel}
      </label>
      <input
        id={inputId}
        type="email"
        name="email"
        autoComplete="email"
        required
        maxLength={254}
        value={value}
        aria-describedby={hintId}
        aria-invalid={showStatus && !isValid}
        className="mt-2 min-h-12 w-full border border-line bg-paper px-4 text-body text-ink"
        onBlur={() => {
          setTouched(true);
        }}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      <p id={hintId} className="mt-2 text-meta leading-6 text-ink-soft">
        {checkoutCopy.emailHint}
      </p>
      {showStatus ? (
        <p
          className={
            isValid
              ? "mt-2 text-meta text-ink"
              : "mt-2 text-meta text-ink-soft"
          }
        >
          {isValid ? checkoutCopy.emailValid : checkoutCopy.emailInvalid}
        </p>
      ) : null}
      <p className="mt-6 text-meta text-ink-soft">
        {checkoutCopy.signInPrompt}{" "}
        <Link
          href={`/${locale}${accountLoginHref}`}
          className="text-ink underline-offset-4 hover:underline"
        >
          {checkoutCopy.signIn}
        </Link>
      </p>
      <p className="mt-2 text-meta leading-6 text-ink-soft">
        {checkoutCopy.accountAfter}
      </p>
    </section>
  );
}
