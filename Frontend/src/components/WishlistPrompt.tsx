"use client";

import { useId, useLayoutEffect, useRef } from "react";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import { shopCopy } from "@/constants/shopCopy";
import {
  accountLoginHref,
  accountRegisterHref,
} from "@/constants/siteNavigation";

type WishlistPromptProps = {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
};

export function WishlistPrompt({ locale, isOpen, onClose }: WishlistPromptProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`dialog-pop m-auto w-[min(28rem,calc(100vw-2rem))] border border-line bg-paper p-6 text-ink${isOpen ? " is-open" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-h3 font-medium">
          {shopCopy.wishlistPromptHeading}
        </h2>
        <button
          type="button"
          className="inline-flex size-11 shrink-0 items-center justify-center"
          aria-label="Close wishlist prompt"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>
      <p className="mt-4 text-body leading-8 text-ink-soft">
        {shopCopy.wishlistPromptBody}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <TextLink href={`/${locale}${accountLoginHref}`}>
          {shopCopy.wishlistPromptCta}
        </TextLink>
        <TextLink href={`/${locale}${accountRegisterHref}`} tone="ghostOnLight">
          {shopCopy.wishlistPromptCreate}
        </TextLink>
        <TextButton tone="ghostOnLight" onClick={onClose}>
          {shopCopy.wishlistPromptContinue}
        </TextButton>
      </div>
    </dialog>
  );
}
