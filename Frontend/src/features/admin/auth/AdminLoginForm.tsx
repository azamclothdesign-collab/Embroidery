"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { TextButton } from "@/components/TextButton";
import { adminAuthCopy } from "@/constants/adminAuthCopy";
import { notifyAdminAuthUpdated } from "@/lib/session/adminAuth";
import { loginFormSchema } from "@/schemas/authFormSchema";
import { loginAdminAction } from "@/server/actions/adminAuthActions";

type AdminLoginFormProps = {
  locale: string;
  nextPath: string;
};

type SubmitState = "idle" | "submitting" | "error";

export function AdminLoginForm({ locale, nextPath }: AdminLoginFormProps) {
  void locale;
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

    void loginAdminAction({
      email: parsed.data.email,
      password: parsed.data.password,
    }).then((result) => {
      if (!result.ok) {
        setSubmitState("error");
        return;
      }

      notifyAdminAuthUpdated();
      router.push(nextPath);
    });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
      <div className="mb-4 rounded-xl bg-accent/10 px-4 py-3 text-[0.9375rem] text-accent">
        <strong>Demo login:</strong> <br />
        Email: admin@example.com <br />
        Password: admin123
      </div>

      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {adminAuthCopy.email}
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
            {adminAuthCopy.invalidEmail}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {adminAuthCopy.password}
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
            {adminAuthCopy.required}
          </span>
        ) : null}
      </label>

      {submitState === "error" ? (
        <p className="text-body leading-7 text-ink" role="alert">
          {adminAuthCopy.loginError}
        </p>
      ) : null}

      <TextButton
        type="submit"
        className="mt-4 w-full"
        disabled={submitState === "submitting"}
      >
        {submitState === "submitting"
          ? adminAuthCopy.loginSubmitting
          : adminAuthCopy.loginSubmit}
      </TextButton>
    </form>
  );
}
