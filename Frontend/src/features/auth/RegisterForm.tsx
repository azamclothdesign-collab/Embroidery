"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TextButton } from "@/components/TextButton";
import { authCopy } from "@/constants/authCopy";
import { accountLoginHref } from "@/constants/siteNavigation";
import { readAccountPreferences, writeAccountPreferences } from "@/lib/accountPreferences";
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

type SubmitState = "idle" | "submitting" | "error-exists";

export function RegisterForm({ locale, nextPath }: RegisterFormProps) {
  const router = useRouter();
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
    setAttempted(true);

    if (!parsed.success) {
      return;
    }

    setSubmitState("submitting");

    void registerCustomerAction({
      email: parsed.data.email,
      password: parsed.data.password,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      confirmPassword: parsed.data.confirmPassword,
    }).then((result) => {
      if (!result.ok) {
        setSubmitState("error-exists");
        return;
      }

      const prefs = readAccountPreferences();
      writeAccountPreferences({
        ...prefs,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        displayName: parsed.data.firstName,
      });

      notifyCustomerAuthUpdated();
      notifyCartUpdated();
      notifyWishlistUpdated();
      router.push(nextPath);
    });
  };

  const strength = passwordStrengthPercent(password);
  const strengthLabel = passwordStrengthLabel(password);

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {authCopy.firstName}
          <input
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
          type="email"
          autoComplete="email"
          className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (submitState === "error-exists") {
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

      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {authCopy.password}
        <input
          type="password"
          autoComplete="new-password"
          className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
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
      </label>

      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {authCopy.confirmPassword}
        <input
          type="password"
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

      <TextButton
        type="submit"
        className="w-full"
        disabled={submitState === "submitting"}
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
