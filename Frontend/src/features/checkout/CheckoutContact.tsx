"use client";

import { useEffect, useId, useState } from "react";

import { checkoutCopy } from "@/constants/checkoutCopy";
import { isValidEmail } from "@/schemas/authFormSchema";

type CheckoutContactProps = {
  contactName: string;
  email: string;
  phone: string;
  showAllErrors: boolean;
  onContactNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onValidityChange: (isValid: boolean) => void;
};

type ContactField = "name" | "email" | "phone";

function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  return /^[+]?[\d\s().-]{7,30}$/.test(trimmed) && trimmed.replace(/\D/g, "").length >= 7;
}

function isValidName(value: string): boolean {
  return value.trim().length >= 2 && value.trim().length <= 120;
}

const labelClassName =
  "block text-meta uppercase tracking-[0.14em] text-ink-soft";
const inputClassName =
  "mt-2 min-h-11 w-full border border-line bg-paper px-3 text-body text-ink";
const errorClassName = "mt-1.5 text-meta text-ink";

export function CheckoutContact({
  contactName,
  email,
  phone,
  showAllErrors,
  onContactNameChange,
  onEmailChange,
  onPhoneChange,
  onValidityChange,
}: CheckoutContactProps) {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const [touched, setTouched] = useState<ReadonlySet<ContactField>>(
    () => new Set(),
  );

  const nameValid = isValidName(contactName);
  const emailValid = isValidEmail(email);
  const phoneValid = isValidPhone(phone);
  const isValid = nameValid && emailValid && phoneValid;
  const showNameError = (showAllErrors || touched.has("name")) && !nameValid;
  const showEmailError = (showAllErrors || touched.has("email")) && !emailValid;
  const showPhoneError = (showAllErrors || touched.has("phone")) && !phoneValid;

  useEffect(() => {
    onValidityChange(isValid);
  }, [isValid, onValidityChange]);

  const markTouched = (field: ContactField) => {
    setTouched((current) =>
      current.has(field) ? current : new Set(current).add(field),
    );
  };

  return (
    <section aria-labelledby="checkout-info-heading">
      <h2 id="checkout-info-heading" className={labelClassName}>
        {checkoutCopy.contactHeading}
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <label htmlFor={nameId} className={labelClassName}>
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
            aria-invalid={showNameError}
            className={inputClassName}
            onBlur={() => {
              markTouched("name");
            }}
            onChange={(event) => {
              onContactNameChange(event.target.value);
            }}
          />
          {showNameError ? (
            <p className={errorClassName}>{checkoutCopy.contactNameInvalid}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor={emailId} className={labelClassName}>
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
            aria-invalid={showEmailError}
            className={inputClassName}
            onBlur={() => {
              markTouched("email");
            }}
            onChange={(event) => {
              onEmailChange(event.target.value);
            }}
          />
          {showEmailError ? (
            <p className={errorClassName}>{checkoutCopy.emailInvalid}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor={phoneId} className={labelClassName}>
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
            aria-invalid={showPhoneError}
            className={inputClassName}
            onBlur={() => {
              markTouched("phone");
            }}
            onChange={(event) => {
              onPhoneChange(event.target.value);
            }}
          />
          {showPhoneError ? (
            <p className={errorClassName}>{checkoutCopy.phoneInvalid}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
