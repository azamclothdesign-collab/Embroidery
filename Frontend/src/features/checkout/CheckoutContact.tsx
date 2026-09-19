"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";

import { checkoutCopy } from "@/constants/checkoutCopy";
import { accountLoginHref } from "@/constants/siteNavigation";
import { isValidEmail } from "@/schemas/authFormSchema";

type CheckoutContactProps = {
  locale: string;
  contactName: string;
  email: string;
  phone: string;
  onContactNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
};

function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  return /^[+]?[\d\s().-]{7,30}$/.test(trimmed) && trimmed.replace(/\D/g, "").length >= 7;
}

function isValidName(value: string): boolean {
  return value.trim().length >= 2 && value.trim().length <= 120;
}

export function CheckoutContact({
  locale,
  contactName,
  email,
  phone,
  onContactNameChange,
  onEmailChange,
  onPhoneChange,
  onValidityChange,
}: CheckoutContactProps) {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const hintId = useId();
  const [touched, setTouched] = useState(false);

  const nameValid = isValidName(contactName);
  const emailValid = isValidEmail(email);
  const phoneValid = isValidPhone(phone);
  const isValid = nameValid && emailValid && phoneValid;
  const showStatus = touched || contactName.length > 0 || email.length > 0 || phone.length > 0;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  return (
    <section aria-labelledby="checkout-info-heading">
      <h2 id="checkout-info-heading" className="text-h3 font-medium text-ink">
        {checkoutCopy.contactHeading}
      </h2>
      <p className="mt-2 text-meta leading-6 text-ink-soft">
        {checkoutCopy.contactBody}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor={nameId}
            className="block text-meta uppercase tracking-[0.14em] text-ink-soft"
          >
            {checkoutCopy.contactNameLabel}
          </label>
          <input
            id={nameId}
            type="text"
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            value={contactName}
            aria-invalid={showStatus && !nameValid}
            className="mt-2 min-h-12 w-full border border-line bg-paper px-4 text-body text-ink"
            onBlur={() => {
              setTouched(true);
            }}
            onChange={(event) => {
              onContactNameChange(event.target.value);
            }}
          />
          {showStatus && !nameValid ? (
            <p className="mt-2 text-meta text-ink-soft">
              {checkoutCopy.contactNameInvalid}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={emailId}
            className="block text-meta uppercase tracking-[0.14em] text-ink-soft"
          >
            {checkoutCopy.emailLabel}
          </label>
          <input
            id={emailId}
            type="email"
            name="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            aria-describedby={hintId}
            aria-invalid={showStatus && !emailValid}
            className="mt-2 min-h-12 w-full border border-line bg-paper px-4 text-body text-ink"
            onBlur={() => {
              setTouched(true);
            }}
            onChange={(event) => {
              onEmailChange(event.target.value);
            }}
          />
          {showStatus ? (
            <p
              className={
                emailValid
                  ? "mt-2 text-meta text-ink"
                  : "mt-2 text-meta text-ink-soft"
              }
            >
              {emailValid ? checkoutCopy.emailValid : checkoutCopy.emailInvalid}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor={phoneId}
            className="block text-meta uppercase tracking-[0.14em] text-ink-soft"
          >
            {checkoutCopy.phoneLabel}
          </label>
          <input
            id={phoneId}
            type="tel"
            name="phone"
            autoComplete="tel"
            required
            maxLength={30}
            value={phone}
            aria-invalid={showStatus && !phoneValid}
            className="mt-2 min-h-12 w-full border border-line bg-paper px-4 text-body text-ink"
            onBlur={() => {
              setTouched(true);
            }}
            onChange={(event) => {
              onPhoneChange(event.target.value);
            }}
          />
          {showStatus && !phoneValid ? (
            <p className="mt-2 text-meta text-ink-soft">
              {checkoutCopy.phoneInvalid}
            </p>
          ) : null}
        </div>
      </div>

      <p id={hintId} className="mt-4 text-meta leading-6 text-ink-soft">
        {checkoutCopy.contactHint}
      </p>
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
