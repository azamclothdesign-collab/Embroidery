"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

import { TextButton } from "@/components/TextButton";
import { authCopy } from "@/constants/authCopy";
import { accountLoginHref } from "@/constants/siteNavigation";
import { useIsClient } from "@/hooks/useIsClient";
import { readAccountPreferences, writeAccountPreferences } from "@/lib/accountPreferences";
import { readFormString } from "@/lib/form/readFormString";
import { notifyCartUpdated } from "@/lib/session/cartSession";
import { notifyCustomerAuthUpdated } from "@/lib/session/customerAuth";
import { notifyWishlistUpdated } from "@/lib/session/wishlistSession";
import {
  passwordStrengthLabel,
  passwordStrengthPercent,
  registerFormSchema,
} from "@/schemas/authFormSchema";
import { registerCustomerAction } from "@/server/actions/customerAuthActions";

type RegisterFormProps = {
  locale: string;
  nextPath: string;
};

type SubmitState = "idle" | "submitting" | "error-exists" | "error-failed";

export function RegisterForm({ locale, nextPath }: RegisterFormProps) {
  const isReady = useIsClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const parsed = registerFormSchema.safeParse({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });

  const fieldError = (path: string): string | null => {
    if (!attempted || parsed.success) {
      return null;
    }

    const issue = parsed.error.issues.find((item) => item.path[0] === path);
    return issue?.message ?? null;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextValues = {
      firstName: readFormString(form, "firstName"),
      lastName: readFormString(form, "lastName"),
      email: readFormString(form, "email"),
      password: readFormString(form, "password"),
      confirmPassword: readFormString(form, "confirmPassword"),
    };
    setFirstName(nextValues.firstName);
    setLastName(nextValues.lastName);
    setEmail(nextValues.email);
    setPassword(nextValues.password);
    setConfirmPassword(nextValues.confirmPassword);
    setAttempted(true);

    const submitted = registerFormSchema.safeParse(nextValues);

    if (!submitted.success) {
      return;
    }

    setSubmitState("submitting");

    void registerCustomerAction({
      email: submitted.data.email,
      password: submitted.data.password,
      firstName: submitted.data.firstName,
      lastName: submitted.data.lastName,
      confirmPassword: submitted.data.confirmPassword,
      nextPath,
    }).then((result) => {
      if (!result.ok) {
        setSubmitState(result.error === "exists" ? "error-exists" : "error-failed");
        return;
      }

      const prefs = readAccountPreferences();
      writeAccountPreferences({
        ...prefs,
        firstName: submitted.data.firstName,
        lastName: submitted.data.lastName,
        displayName: submitted.data.firstName,
      });

      notifyCustomerAuthUpdated();
      notifyCartUpdated();
      notifyWishlistUpdated();
    });
  };

  const strength = passwordStrengthPercent(password);
  const strengthLabel = passwordStrengthLabel(password);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
      data-ready={isReady ? "true" : "false"}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {authCopy.firstName}
          <input
            id="register-first-name"
            name="firstName"
            autoComplete="given-name"
            className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
            }}
          />
          {fieldError("firstName") !== null ? (
            <span className="normal-case tracking-normal text-ink">
              {authCopy.required}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {authCopy.lastName}
          <input
            id="register-last-name"
            name="lastName"
            autoComplete="family-name"
            className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
            }}
          />
          {fieldError("lastName") !== null ? (
            <span className="normal-case tracking-normal text-ink">
              {authCopy.required}
            </span>
          ) : null}
        </label>
      </div>

      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {authCopy.email}
        <input
          id="register-email"
          type="email"
          name="email"
          autoComplete="email"
          className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (submitState === "error-exists" || submitState === "error-failed") {
              setSubmitState("idle");
            }
          }}
        />
        {fieldError("email") !== null ? (
          <span className="normal-case tracking-normal text-ink">
            {authCopy.invalidEmail}
          </span>
        ) : null}
      </label>

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {authCopy.password}
          <input
            id="register-password"
            type="password"
            name="password"
            autoComplete="new-password"
            className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </label>
        <span className="normal-case tracking-normal text-ink-soft">
          {authCopy.passwordHint}
        </span>
        {password.length > 0 ? (
          <span className="normal-case tracking-normal text-ink-soft">
            {authCopy.passwordStrength}: {strengthLabel}
            <span aria-hidden="true" className="mt-2 block h-1 w-full bg-line">
              <span
                className={
                  strength <= 25
                    ? "block h-1 w-1/4 bg-ink"
                    : strength <= 50
                      ? "block h-1 w-1/2 bg-ink"
                      : strength <= 75
                        ? "block h-1 w-3/4 bg-ink"
                        : "block h-1 w-full bg-ink"
                }
              />
            </span>
          </span>
        ) : null}
        {fieldError("password") !== null ? (
          <span className="normal-case tracking-normal text-ink">
            {authCopy.passwordTooShort}
          </span>
        ) : null}
      </div>

      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {authCopy.confirmPassword}
        <input
          id="register-confirm-password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
          }}
        />
        {fieldError("confirmPassword") !== null ? (
          <span className="normal-case tracking-normal text-ink">
            {authCopy.passwordMismatch}
          </span>
        ) : null}
      </label>

      {submitState === "error-exists" ? (
        <p className="text-body leading-7 text-ink" role="alert">
          {authCopy.registerExists}
        </p>
      ) : null}

      {submitState === "error-failed" ? (
        <p className="text-body leading-7 text-ink" role="alert">
          {authCopy.registerFailed}
        </p>
      ) : null}

      <TextButton
        type="submit"
        className="w-full"
        disabled={submitState === "submitting" || !isReady}
      >
        {submitState === "submitting"
          ? authCopy.registerSubmitting
          : authCopy.registerSubmit}
      </TextButton>

      <p className="text-body text-ink-soft">
        {authCopy.registerHasAccount}{" "}
        <Link
          href={`/${locale}${accountLoginHref}?next=${encodeURIComponent(nextPath)}`}
          className="text-ink underline-offset-4 hover:underline"
        >
          {authCopy.signInLink}
        </Link>
      </p>
    </form>
  );
}
