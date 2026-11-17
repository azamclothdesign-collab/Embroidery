"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { RedirectForm } from "@/lib/types";

/** Posts the provider's signed fields to its hosted payment page. */
export function PaymentRedirect({ form, label, buttonLabel }: { form: RedirectForm; label: string; buttonLabel: string }) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    ref.current?.submit();
  }, [form]);

  return (
    <form ref={ref} method="POST" action={form.action} className="flex flex-col items-center gap-4 py-10 text-center" aria-live="polite">
      {Object.entries(form.fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Loader2 className="size-8 animate-spin text-saffron-strong" aria-hidden />
      <p className="font-semibold">{label}</p>
      <button type="submit" className="btn btn-outline">
        {buttonLabel}
      </button>
    </form>
  );
}
