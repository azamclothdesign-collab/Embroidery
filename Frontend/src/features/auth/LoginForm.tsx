"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

import { TextButton } from "@/components/TextButton";
import { authCopy } from "@/constants/authCopy";
import {
  accountForgotHref,
  accountRegisterHref,
} from "@/constants/siteNavigation";
import { useIsClient } from "@/hooks/useIsClient";
import { readFormString } from "@/lib/form/readFormString";
import { notifyCartUpdated } from "@/lib/session/cartSession";
import { notifyCustomerAuthUpdated } from "@/lib/session/customerAuth";
import { notifyWishlistUpdated } from "@/lib/session/wishlistSession";
import { loginFormSchema } from "@/schemas/authFormSchema";
import { loginCustomerAction } from "@/server/actions/customerAuthActions";

type LoginFormProps = {
  locale: string;
  nextPath: string;
};

type SubmitState = "idle" | "submitting" | "error";

export function LoginForm({ locale, nextPath }: LoginFormProps) {
  const isReady = useIsClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const emailInvalid =
    attempted && !loginFormSchema.shape.email.safeParse(email).success;
  const passwordInvalid = attempted && password.trim().length === 0;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextEmail = readFormString(form, "email");
    const nextPassword = readFormString(form, "password");
    setEmail(nextEmail);
    setPassword(nextPassword);
    setAttempted(true);

    const submitted = loginFormSchema.safeParse({
      email: nextEmail,
      password: nextPassword,
    });

    if (!submitted.success) {
      return;
    }

    setSubmitState("submitting");

    void loginCustomerAction({
      email: submitted.data.email,
      password: submitted.data.password,
      nextPath,
    }).then((result) => {
      if (!result.ok) {
        setSubmitState("error");
        return;
      }

      notifyCustomerAuthUpdated();
      notifyCartUpdated();
      notifyWishlistUpdated();
    });
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
      data-ready={isReady ? "true" : "false"}
    >
      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {authCopy.email}
        <input
          id="customer-login-email"
          type="email"
          name="email"
          autoComplete="email"
          className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (submitState === "error") {
              setSubmitState("idle");
            }
          }}
          aria-invalid={emailInvalid}
        />
        {emailInvalid ? (
          <span className="normal-case tracking-normal text-ink">
            {authCopy.invalidEmail}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {authCopy.password}
        <input
          id="customer-login-password"
          type="password"
          name="password"
          autoComplete="current-password"
          className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (submitState === "error") {
              setSubmitState("idle");
            }
          }}
          aria-invalid={passwordInvalid}
        />
        {passwordInvalid ? (
          <span className="normal-case tracking-normal text-ink">
            {authCopy.required}
          </span>
        ) : null}
      </label>

      <div className="flex justify-end">
        <Link
          href={`/${locale}${accountForgotHref}`}
          className="min-h-11 text-meta uppercase tracking-[0.14em] text-ink underline-offset-4 hover:underline"
        >
          {authCopy.forgotLink}
        </Link>
      </div>

      {submitState === "error" ? (
        <p className="text-body leading-7 text-ink" role="alert">
          {authCopy.loginError}
        </p>
      ) : null}

      <TextButton
        type="submit"
        className="w-full"
        disabled={submitState === "submitting" || !isReady}
      >
        {submitState === "submitting"
          ? authCopy.loginSubmitting
          : authCopy.loginSubmit}
      </TextButton>

      <p className="text-body text-ink-soft">
        {authCopy.loginNoAccount}{" "}
        <Link
          href={`/${locale}${accountRegisterHref}?next=${encodeURIComponent(nextPath)}`}
          className="text-ink underline-offset-4 hover:underline"
        >
          {authCopy.createAccount}
        </Link>
      </p>
    </form>
  );
}
