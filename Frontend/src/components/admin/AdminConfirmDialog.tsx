"use client";

import { type ReactNode, useId, useLayoutEffect, useRef } from "react";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { adminCopy } from "@/constants/adminCopy";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: () => void;
  pendingNote?: string;
  children?: ReactNode;
};

export function AdminConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onClose,
  onConfirm,
  pendingNote,
  children,
}: AdminConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (open) {
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
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className={`dialog-pop admin-dialog backdrop:bg-admin-nav/50${open ? " is-open" : ""}`}
      onClose={onClose}
    >
      <div className="border-b border-admin-line px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="admin-panel-kicker">{adminCopy.sidebarLabel}</p>
            <h2
              id={titleId}
              className="mt-2 text-xl font-semibold tracking-tight text-admin-ink"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center border border-transparent text-admin-ink-soft transition-colors hover:border-admin-line hover:bg-admin-input hover:text-admin-ink"
            aria-label={adminCopy.confirmClose}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="px-6 py-5">
        <p className="text-[0.9375rem] leading-7 text-admin-ink-soft">{body}</p>
        {pendingNote === undefined ? null : (
          <p className="mt-3 border border-admin-line bg-admin-input px-3 py-2 text-[0.8125rem] leading-5 text-admin-ink-soft">
            {pendingNote}
          </p>
        )}
        {children === undefined ? null : <div className="mt-4">{children}</div>}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="admin-link-ghost justify-center"
            onClick={onClose}
          >
            {adminCopy.orderDetailRefundCancel}
          </button>
          <button
            type="button"
            className="admin-link-action justify-center"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
