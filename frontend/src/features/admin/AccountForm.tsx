"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { useActionState } from "react";
import { credentialsAction, type FormResult } from "@/actions/adminAuth";
import { FormMessage, PasswordInput, fieldErr } from "./AuthForms";

export function AccountForm({ email, force }: { email: string; force: boolean }) {
  const [state, action, pending] = useActionState<FormResult, FormData>(credentialsAction, null);
  return (
    <form action={action} className="card max-w-xl space-y-5 p-6">
      {force && (
        <p className="flex items-start gap-3 rounded-xl bg-gold-soft px-4 py-3 text-sm font-semibold">
          <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          You signed in with the one-time password from the server .env file. Set your own email and a new password to unlock the admin.
        </p>
      )}
      <div>
        <label htmlFor="newEmail" className="field-label">Email</label>
        <input id="newEmail" name="newEmail" type="email" defaultValue={email} autoComplete="username" className="field" aria-invalid={fieldErr(state, "newEmail") !== undefined} />
        <p className={fieldErr(state, "newEmail") ? "field-error" : "field-help"}>{fieldErr(state, "newEmail") ?? "Password reset links are sent here."}</p>
      </div>
      <div>
        <label htmlFor="newPassword" className="field-label">New password {force ? <span className="text-danger">*</span> : <span className="font-normal text-muted">(leave empty to keep)</span>}</label>
        <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" invalid={fieldErr(state, "newPassword") !== undefined} />
        <p className={fieldErr(state, "newPassword") ? "field-error" : "field-help"}>{fieldErr(state, "newPassword") ?? "At least 10 characters with letters and numbers."}</p>
      </div>
      <div>
        <label htmlFor="confirm" className="field-label">Confirm new password</label>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password" invalid={fieldErr(state, "confirm") !== undefined} />
        {fieldErr(state, "confirm") && <p className="field-error">{fieldErr(state, "confirm")}</p>}
      </div>
      <div className="border-t border-line pt-5">
        <label htmlFor="currentPassword" className="field-label">Current password <span className="text-danger">*</span></label>
        <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" invalid={fieldErr(state, "currentPassword") !== undefined} />
        {fieldErr(state, "currentPassword") && <p className="field-error">{fieldErr(state, "currentPassword")}</p>}
      </div>
      <FormMessage state={state} />
      <button type="submit" className="btn btn-dark" disabled={pending}>
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        Save credentials
      </button>
    </form>
  );
}
