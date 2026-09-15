"use client";

import { useId, useLayoutEffect, useRef } from "react";

import { checkoutCopy } from "@/constants/checkoutCopy";

export type CheckoutOverlayPhase =
  | "hidden"
  | "processing"
  | "confirmed"
  | "preparing";

type CheckoutProcessingOverlayProps = {
  phase: CheckoutOverlayPhase;
};

export function CheckoutProcessingOverlay({
  phase,
}: CheckoutProcessingOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isOpen = phase !== "hidden";

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }

      return;
    }

    if (!dialog.open) {
      return;
    }

    const timer = window.setTimeout(() => {
      dialog.close();
    }, 380);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen]);

  const message =
    phase === "confirmed"
      ? checkoutCopy.confirmed
      : phase === "preparing"
        ? checkoutCopy.preparing
        : checkoutCopy.processing;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`overlay-fade fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-ink/90 p-6 text-paper open:flex open:items-center open:justify-center${isOpen ? " is-visible" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
      }}
    >
      <div className="max-w-md text-center">
        <p id={titleId} className="text-title-sm font-medium tracking-tight">
          {message}
        </p>
        {phase === "confirmed" ? (
          <p className="mt-6 text-h3" aria-hidden="true">
            ✓
          </p>
        ) : null}
      </div>
    </dialog>
  );
}
