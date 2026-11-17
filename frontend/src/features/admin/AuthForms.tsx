"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { forgotAction, loginAction, resetAction, type FormResult } from "@/actions/adminAuth";

export function PasswordInput({ id, name, autoComplete, invalid }: { id: string; name: string; autoComplete: string; invalid?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input id={id} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required className="field pe-12" aria-invalid={invalid} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute end-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}

export function FormMessage({ state }: { state: FormResult }) {
  if (state === null) return null;
  if (state.ok) return state.message ? <p role="status" className="rounded-xl bg-teal-soft px-4 py-3 text-sm font-semibold text-teal">{state.message}</p> : null;
  return (
    <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
      {state.message}
    </p>
  );
}

export const fieldErr = (state: FormResult, key: string) => (state !== null && !state.ok ? state.fields?.[key] : undefined);

export function LoginForm({ notice }: { notice: string | null }) {
  const [state, action, pending] = useActionState<FormResult, FormData>(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      {notice !== null && <p className="rounded-xl bg-gold-soft px-4 py-3 text-sm font-semibold">{notice}</p>}
      <div>
        <label htmlFor="email" className="field-label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="field-label">Password</label>
          <Link href="/admin/forgot" className="mb-1.5 text-sm font-semibold text-teal hover:underline">Forgot password?</Link>
        </div>
        <PasswordInput id="password" name="password" autoComplete="current-password" />
      </div>
      <FormMessage state={state} />
      <button type="submit" className="btn btn-dark w-full" disabled={pending}>
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        Sign in
      </button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState<FormResult, FormData>(forgotAction, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="field-label">Admin email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <FormMessage state={state} />
      <button type="submit" className="btn btn-dark w-full" disabled={pending}>
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        Send reset link
      </button>
      <Link href="/admin/login" className="btn btn-ghost w-full">Back to sign in</Link>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormResult, FormData>(resetAction, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="field-label">New password</label>
        <PasswordInput id="password" name="password" autoComplete="new-password" invalid={fieldErr(state, "password") !== undefined} />
        <p className={fieldErr(state, "password") ? "field-error" : "field-help"}>{fieldErr(state, "password") ?? "At least 10 characters, with letters and numbers."}</p>
      </div>
      <div>
        <label htmlFor="confirm" className="field-label">Confirm password</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={fieldErr(state, "confirm") !== undefined} />
        {fieldErr(state, "confirm") && <p className="field-error">{fieldErr(state, "confirm")}</p>}
      </div>
      <FormMessage state={state} />
      <button type="submit" className="btn btn-dark w-full" disabled={pending}>
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        Set new password
      </button>
    </form>
  );
}
