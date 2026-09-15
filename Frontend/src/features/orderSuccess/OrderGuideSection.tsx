"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { TextButton } from "@/components/TextButton";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { type LocalOrder } from "@/lib/session/orderSession";

type OrderGuideSectionProps = {
  order: LocalOrder;
  onToast: (message: string) => void;
};

export function OrderGuideSection({ order, onToast }: OrderGuideSectionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const primaryName = order.lines[0]?.displayName ?? "Embroidery Design";

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

  return (
    <section
      className="mx-auto w-full max-w-[85rem] px-6 py-12 md:py-16"
      aria-labelledby="order-guide-heading"
    >
      <h2
        id="order-guide-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {orderSuccessCopy.guideHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {orderSuccessCopy.guideBody}
      </p>
      <div className="mt-10 border border-line bg-surface px-6 py-12 md:mx-auto md:max-w-xl md:px-12 md:py-16">
        <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
          Embroidery Guide
        </p>
        <p className="mt-4 text-h3 font-medium text-ink">{primaryName}</p>
        <ul className="mt-8 flex flex-col gap-3 text-body text-ink-soft">
          {orderSuccessCopy.guideTopics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <TextButton
            onClick={() => {
              setIsOpen(true);
            }}
          >
            {orderSuccessCopy.viewGuide}
          </TextButton>
          <TextButton
            tone="ghostOnLight"
            onClick={() => {
              onToast(orderSuccessCopy.downloadPendingNote);
            }}
          >
            {orderSuccessCopy.downloadGuide}
          </TextButton>
        </div>
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className={`dialog-pop m-auto w-[min(36rem,calc(100vw-2rem))] border border-line bg-paper p-6 text-ink open:flex open:flex-col${isOpen ? " is-open" : ""}`}
        onCancel={(event) => {
          event.preventDefault();
          setIsOpen(false);
        }}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-h3 font-medium">
            {primaryName} — Embroidery Guide
          </h2>
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center"
            aria-label="Close guide preview"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <CloseIcon />
          </button>
        </div>
        <ul className="mt-6 flex flex-col gap-3 text-body leading-8 text-ink-soft">
          {orderSuccessCopy.guideTopics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </dialog>
    </section>
  );
}
