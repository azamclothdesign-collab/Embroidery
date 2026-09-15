"use client";

import { useEffect } from "react";

type WishlistToastProps = {
  message: string | null;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  onHide: () => void;
};

export function WishlistToast({
  message,
  actionLabel,
  onAction,
  onHide,
}: WishlistToastProps) {
  const isVisible = message !== null;

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timer = window.setTimeout(() => {
      onHide();
    }, 4200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isVisible, message, onHide]);

  return (
    <div
      role="status"
      className={`fade-rise fixed bottom-28 left-1/2 z-40 flex -translate-x-1/2 items-center gap-4 border border-line bg-paper px-5 py-3 text-meta text-ink${isVisible ? " is-visible" : ""}`}
    >
      <span>{message}</span>
      {actionLabel !== undefined && onAction !== undefined ? (
        <button
          type="button"
          className="min-h-11 uppercase tracking-[0.14em] text-ink underline-offset-4 hover:underline"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
