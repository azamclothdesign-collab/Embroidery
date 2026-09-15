"use client";

import { useId, useState } from "react";

import { TextButton } from "@/components/TextButton";
import { cartCopy } from "@/constants/cartCopy";

type CartCouponProps = {
  onAppliedChange: (discountCents: number) => void;
};

export function CartCoupon({ onAppliedChange }: CartCouponProps) {
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
        {cartCopy.havePromo}
      </button>
      <div className={`collapse-panel${isOpen ? " is-open" : ""}`}>
        <div className="collapse-panel-inner">
          <form
            className="flex flex-col gap-3 pt-4 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              onAppliedChange(0);
              setMessage(cartCopy.promoInvalid);
            }}
          >
            <label className="sr-only" htmlFor={inputId}>
              {cartCopy.promoPlaceholder}
            </label>
            <input
              id={inputId}
              value={code}
              maxLength={40}
              placeholder={cartCopy.promoPlaceholder}
              className="min-h-11 flex-1 border border-line bg-paper px-3 text-body text-ink"
              onChange={(event) => {
                setCode(event.target.value);
                setMessage(null);
              }}
            />
            <TextButton type="submit" tone="ghostOnLight" className="shrink-0">
              {cartCopy.apply}
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
