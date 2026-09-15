"use client";

import { useId, useLayoutEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminImageField } from "@/components/admin/AdminImageField";
import { adminCopy } from "@/constants/adminCopy";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/server/actions/adminCatalogActions";

type AdminCategoryDialogFormProps = {
  mode: "create" | "edit";
  initialCategoryId: string;
  initialCategoryLabel: string;
  initialSortOrder: number;
  initialIsVisible: boolean;
  initialImageSrc: string;
  initialImageAlt: string;
  onClose: () => void;
  titleId: string;
};

function AdminCategoryDialogForm({
  mode,
  initialCategoryId,
  initialCategoryLabel,
  initialSortOrder,
  initialIsVisible,
  initialImageSrc,
  initialImageAlt,
  onClose,
  titleId,
}: AdminCategoryDialogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [categoryId, setCategoryId] = useState(
    mode === "create" ? "" : initialCategoryId,
  );
  const [label, setLabel] = useState(
    mode === "create" ? "" : initialCategoryLabel,
  );
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [isVisible, setIsVisible] = useState(initialIsVisible);
  const [imageSrc, setImageSrc] = useState(initialImageSrc);
  const [imageAlt, setImageAlt] = useState(initialImageAlt);
  const [saveLabel, setSaveLabel] = useState<string>(adminCopy.productsSave);
  const [error, setError] = useState<string | null>(null);

  const onSave = () => {
    const trimmedId = categoryId.trim();
    const trimmedLabel = label.trim();
    const trimmedImageSrc = imageSrc.trim();
    const trimmedImageAlt =
      imageAlt.trim().length > 0
        ? imageAlt.trim()
        : `${trimmedLabel} designs`;

    if (trimmedId.length === 0 || trimmedLabel.length === 0) {
      setError("ID and label are required.");
      return;
    }

    if (trimmedImageSrc.length === 0) {
      setError(adminCopy.categoriesImageRequired);
      return;
    }

    setError(null);
    setSaveLabel(adminCopy.productsSaving);

    startTransition(async () => {
      const payload = {
        id: trimmedId,
        label: trimmedLabel,
        sortOrder,
        isVisible,
        imageSrc: trimmedImageSrc,
        imageAlt: trimmedImageAlt,
      };
      const result =
        mode === "create"
          ? await createCategoryAction(payload)
          : await updateCategoryAction(payload);

      if (!result.ok) {
        setSaveLabel(adminCopy.productsSave);
        setError(result.error);
        return;
      }

      setSaveLabel(adminCopy.productsSaved);
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="px-6 py-6">
      <p className="admin-panel-kicker">{adminCopy.sidebarLabel}</p>
      <h2 id={titleId} className="mt-2 text-xl font-semibold tracking-tight text-admin-ink">
        {mode === "create" ? adminCopy.categoriesCreate : adminCopy.categoriesMenuEdit}
      </h2>
      <div className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-admin-ink-soft">
          ID / Slug
          <input
            type="text"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-body normal-case tracking-normal text-admin-ink"
            placeholder="e.g. floral"
            disabled={mode === "edit"}
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-admin-ink-soft">
          Display Label
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-body normal-case tracking-normal text-admin-ink"
            placeholder="e.g. Floral"
            required
          />
        </label>
        <AdminImageField
          label={adminCopy.categoriesImage}
          value={imageSrc}
          altLabel={adminCopy.categoriesImageAlt}
          altValue={imageAlt}
          onChange={setImageSrc}
          onAltChange={setImageAlt}
        />
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-admin-ink-soft">
          Sort order
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-body normal-case tracking-normal text-admin-ink"
          />
        </label>
        <label className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-admin-ink-soft">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="size-4"
          />
          Visible
        </label>
        {error === null ? null : (
          <p className="text-[0.875rem] text-admin-error">{error}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="admin-link-action disabled:opacity-70"
            onClick={onSave}
            disabled={isPending}
          >
            {saveLabel}
          </button>
          <button
            type="button"
            className="admin-link-ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

type AdminCategoryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialCategoryId?: string;
  initialCategoryLabel?: string;
  initialSortOrder?: number;
  initialIsVisible?: boolean;
  initialImageSrc?: string;
  initialImageAlt?: string;
  resetKey: number;
};

export function AdminCategoryDialog({
  isOpen,
  onClose,
  mode,
  initialCategoryId = "",
  initialCategoryLabel = "",
  initialSortOrder = 0,
  initialIsVisible = true,
  initialImageSrc = "",
  initialImageAlt = "",
  resetKey,
}: AdminCategoryDialogProps) {
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
      className={`dialog-pop admin-dialog-wide backdrop:bg-admin-nav/50${isOpen ? " is-open" : ""}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      {isOpen ? (
        <AdminCategoryDialogForm
          key={`${resetKey}-${mode}-${initialCategoryId}`}
          mode={mode}
          initialCategoryId={initialCategoryId}
          initialCategoryLabel={initialCategoryLabel}
          initialSortOrder={initialSortOrder}
          initialIsVisible={initialIsVisible}
          initialImageSrc={initialImageSrc}
          initialImageAlt={initialImageAlt}
          onClose={onClose}
          titleId={titleId}
        />
      ) : null}
    </dialog>
  );
}
