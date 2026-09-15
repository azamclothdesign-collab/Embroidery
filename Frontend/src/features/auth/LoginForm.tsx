"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { TextButton } from "@/components/TextButton";
import { authCopy } from "@/constants/authCopy";
import {
  accountForgotHref,
  accountRegisterHref,
} from "@/constants/siteNavigation";
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
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const parsed = loginFormSchema.safeParse({ email, password });
  const emailInvalid =
    attempted && !loginFormSchema.shape.email.safeParse(email).success;
  const passwordInvalid = attempted && password.trim().length === 0;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempted(true);

    if (!parsed.success) {
      return;
    }

    setSubmitState("submitting");

    void loginCustomerAction({
      email: parsed.data.email,
      password: parsed.data.password,
    }).then((result) => {
      if (!result.ok) {
        setSubmitState("error");
        return;
      }

      notifyCustomerAuthUpdated();
      notifyCartUpdated();
      notifyWishlistUpdated();
      router.push(nextPath);
    });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {authCopy.email}
        <input
          type="email"
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
          type="password"
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
        disabled={submitState === "submitting"}
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
