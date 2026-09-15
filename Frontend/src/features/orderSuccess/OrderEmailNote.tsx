"use client";

import { orderSuccessCopy } from "@/constants/orderSuccessCopy";

type OrderEmailNoteProps = {
  email: string;
  onResend: () => void;
};

export function OrderEmailNote({ email, onResend }: OrderEmailNoteProps) {
  return (
    <section className="mx-auto w-full max-w-[85rem] px-6 py-8">
      <p className="max-w-2xl text-meta leading-6 text-ink-soft">
        {orderSuccessCopy.emailReassurancePrefix}{" "}
        <span className="text-ink">{email}</span>.
      </p>
      <button
        type="button"
        className="mt-3 min-h-11 text-meta uppercase tracking-[0.14em] text-ink underline-offset-4 hover:underline"
        onClick={onResend}
      >
        {orderSuccessCopy.resendEmail}
      </button>
    </section>
  );
}
