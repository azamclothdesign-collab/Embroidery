"use client";

import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { startPaymentAction } from "@/actions/store";
import { PaymentRedirect } from "@/features/checkout/PaymentRedirect";
import type { RedirectForm } from "@/lib/types";

export function PayButton({ number, label, redirecting }: { number: string; label: string; redirecting: string }) {
  const [form, setForm] = useState<RedirectForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (form !== null) return <PaymentRedirect form={form} label={redirecting} buttonLabel={label} />;
  return (
    <div>
      <button
        type="button"
        className="btn btn-primary w-full sm:w-auto"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await startPaymentAction(number);
            if (result.ok) setForm({ action: result.action, method: "POST", fields: result.fields });
            else setError(result.message);
          })
        }
      >
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {label}
      </button>
      {error !== null && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

type ProofLabels = { title: string; ref: string; file: string; send: string; sent: string };

export function BankProofForm({ action, labels }: { action: string; labels: ProofLabels }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "sent") return <p className="rounded-xl bg-teal-soft px-4 py-3 font-semibold text-teal">{labels.sent}</p>;

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        const file = (formElement.elements.namedItem("receipt") as HTMLInputElement).files?.[0];
        const ref = (formElement.elements.namedItem("ref") as HTMLInputElement).value.trim();
        if (file === undefined) {
          setError(labels.file);
          return;
        }
        setState("sending");
        setError(null);
        const body = new FormData();
        body.append("receipt", file);
        try {
          const response = await fetch(`${action}?ref=${encodeURIComponent(ref)}`, { method: "POST", body });
          if (!response.ok) {
            const problem = (await response.json().catch(() => ({}))) as { title?: string };
            throw new Error(problem.title ?? "Upload failed");
          }
          setState("sent");
          router.refresh();
        } catch (uploadError) {
          setState("idle");
          setError((uploadError as Error).message);
        }
      }}
    >
      <h3 className="font-semibold">{labels.title}</h3>
      <div>
        <label htmlFor="proof-ref" className="field-label">
          {labels.ref}
        </label>
        <input id="proof-ref" name="ref" maxLength={100} className="field" dir="ltr" />
      </div>
      <div>
        <label htmlFor="proof-file" className="field-label">
          {labels.file}
        </label>
        <input id="proof-file" name="receipt" type="file" accept="image/jpeg,image/png,image/webp" required className="field py-2.5 file:me-3 file:rounded-full file:border-0 file:bg-sand file:px-4 file:py-1.5 file:font-semibold" />
      </div>
      {error !== null && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-dark" disabled={state === "sending"}>
        {state === "sending" ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Upload className="size-4" aria-hidden />}
        {labels.send}
      </button>
    </form>
  );
}
