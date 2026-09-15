"use client";

import { useEffect } from "react";

type OrderSuccessToastProps = {
  message: string | null;
  onHide: () => void;
};

export function OrderSuccessToast({ message, onHide }: OrderSuccessToastProps) {
  const isVisible = message !== null;

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timer = window.setTimeout(() => {
      onHide();
    }, 3600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isVisible, message, onHide]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fade-rise fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center border border-line bg-paper px-5 py-3 text-meta text-ink${isVisible ? " is-visible" : ""}`}
    >
      <span>{message}</span>
    </div>
  );
}
