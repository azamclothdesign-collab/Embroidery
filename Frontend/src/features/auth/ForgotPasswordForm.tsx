"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";

import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import { authCopy } from "@/constants/authCopy";
import { accountLoginHref } from "@/constants/siteNavigation";
import { useIsClient } from "@/hooks/useIsClient";
import { readFormString } from "@/lib/form/readFormString";
import {
  forgotRequestSchema,
  forgotResetSchema,
  passwordStrengthLabel,
  passwordStrengthPercent,
} from "@/schemas/authFormSchema";
import { forgotPasswordAction } from "@/server/actions/customerAuthActions";

type ForgotPasswordFormProps = {
  locale: string;
};

type Step = "request" | "reset" | "success";
type SubmitState = "idle" | "submitting" | "error";

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const isReady = useIsClient();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const onRequest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextEmail = readFormString(form, "email");
    setEmail(nextEmail);
    setAttempted(true);
    const parsed = forgotRequestSchema.safeParse({ email: nextEmail });

    if (!parsed.success) {
      return;
    }

    setSubmitState("submitting");

    void forgotPasswordAction({ email: parsed.data.email }).then((result) => {
      if (!result.ok) {
        setSubmitState("error");
        return;
      }

      setEmail(parsed.data.email);
      setSubmitState("idle");
      setAttempted(false);
      setStep("reset");
    });
  };

  const onReset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextPassword = readFormString(form, "password");
    const nextConfirmPassword = readFormString(form, "confirmPassword");
    setPassword(nextPassword);
    setConfirmPassword(nextConfirmPassword);
    setAttempted(true);
    const parsed = forgotResetSchema.safeParse({
      email,
      password: nextPassword,
      confirmPassword: nextConfirmPassword,
    });

    if (!parsed.success) {
      return;
    }

    setSubmitState("submitting");

    void forgotPasswordAction({
      email: parsed.data.email,
      password: parsed.data.password,
      confirmPassword: parsed.data.confirmPassword,
    }).then((result) => {
      if (!result.ok) {
        setSubmitState("error");
        return;
      }

      setSubmitState("idle");
      setStep("success");
    });
  };

  const strength = passwordStrengthPercent(password);
  const strengthLabel = passwordStrengthLabel(password);
  const emailInvalid =
    attempted && step === "request" && !forgotRequestSchema.shape.email.safeParse(email).success;

  if (step === "success") {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-body leading-8 text-ink" role="status">
          {authCopy.forgotSuccess}
        </p>
        <TextLink href={`/${locale}${accountLoginHref}`}>
          {authCopy.backToSignIn}
        </TextLink>
      </div>
    );
  }

  if (step === "reset") {
    const resetParsed = forgotResetSchema.safeParse({
      email,
      password,
      confirmPassword,
    });
    const passwordError =
      attempted &&
      (!resetParsed.success
        ? resetParsed.error.issues.find((item) => item.path[0] === "password")
        : undefined);
    const confirmError =
      attempted &&
      (!resetParsed.success
        ? resetParsed.error.issues.find(
            (item) => item.path[0] === "confirmPassword",
          )
        : undefined);

    return (
      <form
        className="flex flex-col gap-5"
        onSubmit={onReset}
        noValidate
        data-ready={isReady ? "true" : "false"}
      >
        <h2 className="text-h3 font-medium tracking-tight text-ink">
          {authCopy.forgotResetHeading}
        </h2>
        <p className="text-body text-ink-soft">{email}</p>
        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {authCopy.password}
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
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
          {passwordError !== undefined ? (
            <span className="normal-case tracking-normal text-ink">
              {authCopy.passwordTooShort}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {authCopy.confirmPassword}
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
            }}
          />
          {confirmError !== undefined ? (
            <span className="normal-case tracking-normal text-ink">
              {authCopy.passwordMismatch}
            </span>
          ) : null}
        </label>
        {submitState === "error" ? (
          <p className="text-body text-ink" role="alert">
            {authCopy.forgotMissing}
          </p>
        ) : null}
        <TextButton type="submit" className="w-full" disabled={submitState === "submitting" || !isReady}>
          {submitState === "submitting"
            ? authCopy.forgotResetSubmitting
            : authCopy.forgotResetSubmit}
        </TextButton>
        <Link
          href={`/${locale}${accountLoginHref}`}
          className="min-h-11 text-center text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
        >
          {authCopy.backToSignIn}
        </Link>
      </form>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={onRequest}
      noValidate
      data-ready={isReady ? "true" : "false"}
    >
      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {authCopy.email}
        <input
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
        />
        {emailInvalid ? (
          <span className="normal-case tracking-normal text-ink">
            {authCopy.invalidEmail}
          </span>
        ) : null}
      </label>
      {submitState === "error" ? (
        <p className="text-body text-ink" role="alert">
          {authCopy.forgotMissing}
        </p>
      ) : null}
      <TextButton type="submit" className="w-full" disabled={submitState === "submitting" || !isReady}>
        {submitState === "submitting" ? authCopy.loginSubmitting : authCopy.forgotContinue}
      </TextButton>
      <Link
        href={`/${locale}${accountLoginHref}`}
        className="min-h-11 text-center text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
      >
        {authCopy.backToSignIn}
      </Link>
    </form>
  );
}
