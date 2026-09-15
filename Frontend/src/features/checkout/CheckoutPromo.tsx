"use client";

import { useId, useState } from "react";

import { TextButton } from "@/components/TextButton";
import { checkoutCopy } from "@/constants/checkoutCopy";

type CheckoutPromoProps = {
  onAppliedChange: (discountCents: number) => void;
};

export function CheckoutPromo({ onAppliedChange }: CheckoutPromoProps) {
  const inputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="border-t border-line pt-5">
      <button
        type="button"
        className="min-h-11 text-left text-meta uppercase tracking-[0.14em] text-ink"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
          setMessage(null);
        }}
      >
        {checkoutCopy.havePromo}
      </button>
      <div className={`collapse-panel${isOpen ? " is-open" : ""}`}>
        <div className="collapse-panel-inner">
          <form
            className="flex flex-col gap-3 pt-4 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              onAppliedChange(0);
              setMessage(checkoutCopy.promoInvalid);
            }}
          >
            <label className="sr-only" htmlFor={inputId}>
              {checkoutCopy.promoPlaceholder}
            </label>
            <input
              id={inputId}
              value={code}
              maxLength={40}
              placeholder={checkoutCopy.promoPlaceholder}
              className="min-h-11 flex-1 border border-line bg-paper px-3 text-body text-ink"
              onChange={(event) => {
                setCode(event.target.value);
                setMessage(null);
              }}
            />
            <TextButton type="submit" tone="ghostOnLight" className="shrink-0">
              {checkoutCopy.apply}
            </TextButton>
          </form>
          {message !== null ? (
            <p className="mt-3 text-meta leading-6 text-ink-soft">{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
