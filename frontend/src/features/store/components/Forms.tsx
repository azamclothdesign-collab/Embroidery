"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { contactAction, trackAction, type ActionError } from "@/actions/store";

type State = { ok: true } | ActionError | null;

function Field({
  id,
  name,
  label,
  type = "text",
  help,
  error,
  multiline = false,
  required = true,
  dir,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  help?: string;
  error?: string | undefined;
  multiline?: boolean;
  required?: boolean;
  dir?: "ltr" | "auto";
  autoComplete?: string;
}) {
  const describedBy = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {multiline ? (
        <textarea id={id} name={name} required={required} rows={5} className="field py-3" aria-invalid={error !== undefined} aria-describedby={describedBy} dir="auto" />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          className="field"
          aria-invalid={error !== undefined}
          aria-describedby={describedBy}
          {...(dir === undefined ? {} : { dir })}
          {...(autoComplete === undefined ? {} : { autoComplete })}
        />
      )}
      <p id={describedBy} className={error !== undefined ? "field-error" : "field-help"}>
        {error ?? help ?? ""}
      </p>
    </div>
  );
}

function Feedback({ state, success }: { state: State; success: string }) {
  if (state === null) return null;
  if (state.ok) {
    return (
      <p role="status" className="flex items-center gap-2 rounded-xl bg-teal-soft px-4 py-3 font-semibold text-teal">
        <CheckCircle2 className="size-5" aria-hidden />
        {success}
      </p>
    );
  }
  return (
    <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
      {state.message}
    </p>
  );
}

const fieldError = (state: State, key: string) => (state !== null && !state.ok ? state.fields?.[key] : undefined);

export function TrackForm({ labels }: { labels: { number: string; numberHelp: string; email: string; submit: string; sent: string } }) {
  const [state, action, pending] = useActionState<State, FormData>(trackAction, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      <Field id="track-number" name="number" label={labels.number} help={labels.numberHelp} error={fieldError(state, "number")} dir="ltr" />
      <Field id="track-email" name="email" type="email" label={labels.email} error={fieldError(state, "email")} dir="ltr" autoComplete="email" />
      <Feedback state={state} success={labels.sent} />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {labels.submit}
      </button>
    </form>
  );
}

export function ContactForm({
  labels,
}: {
  labels: { name: string; email: string; phone: string; message: string; send: string; sent: string };
}) {
  const [state, action, pending] = useActionState<State, FormData>(contactAction, null);
  if (state?.ok === true) return <Feedback state={state} success={labels.sent} />;
  return (
    <form action={action} className="card space-y-4 p-6">
      <Field id="contact-name" name="name" label={labels.name} error={fieldError(state, "name")} autoComplete="name" />
      <Field id="contact-email" name="email" type="email" label={labels.email} error={fieldError(state, "email")} dir="ltr" autoComplete="email" />
      <Field id="contact-phone" name="phone" type="tel" label={labels.phone} required={false} dir="ltr" autoComplete="tel" />
      <Field id="contact-message" name="message" label={labels.message} error={fieldError(state, "message")} multiline />
      <div aria-hidden className="hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Feedback state={state} success={labels.sent} />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {labels.send}
      </button>
    </form>
  );
}
