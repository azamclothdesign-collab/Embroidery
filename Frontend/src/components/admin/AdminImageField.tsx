"use client";

import { useRef, useState, useTransition } from "react";

import { CoverImage } from "@/components/CoverImage";
import { adminCopy } from "@/constants/adminCopy";
import { uploadAdminImageAction } from "@/server/actions/adminCatalogActions";

type AdminImageFieldProps = {
  label: string;
  value: string;
  altLabel?: string;
  altValue?: string;
  onChange: (url: string) => void;
  onAltChange?: (alt: string) => void;
};

export function AdminImageField({
  label,
  value,
  altLabel,
  altValue,
  onChange,
  onAltChange,
}: AdminImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onPickFile = (fileList: FileList | null) => {
    const file = fileList?.[0];

    if (file === undefined) {
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadAdminImageAction(formData);

      if (!result.ok) {
        setError(adminCopy.productsImageUploadFailed);
        return;
      }

      onChange(result.data.url);

      if (onAltChange !== undefined && (altValue === undefined || altValue.trim().length === 0)) {
        const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        onAltChange(baseName);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative aspect-[4/5] w-full max-w-[10rem] overflow-hidden border border-line bg-paper">
          {value.trim().length === 0 ? (
            <div className="flex size-full items-center justify-center text-[0.8125rem] text-ink-soft">
              {adminCopy.emDash}
            </div>
          ) : (
            <CoverImage
              src={value.trim()}
              alt={altValue?.trim().length ? altValue.trim() : label}
              sizes="160px"
              className="absolute inset-0 size-full max-w-none object-cover"
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
            {label}
            <input
              value={value}
              onChange={(event) => {
                onChange(event.target.value);
              }}
              className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                onPickFile(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="inline-flex min-h-11 items-center border border-line bg-paper px-4 text-meta uppercase tracking-[0.14em] text-ink disabled:opacity-70"
              disabled={isPending}
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              {isPending
                ? adminCopy.productsImageUploading
                : adminCopy.productsImageUpload}
            </button>
            <p className="text-[0.8125rem] text-ink-soft">
              {adminCopy.productsImageUploadHint}
            </p>
          </div>
          {error === null ? null : (
            <p className="text-[0.875rem] text-ink-soft">{error}</p>
          )}
        </div>
      </div>
      {altLabel === undefined || onAltChange === undefined ? null : (
        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {altLabel}
          <input
            value={altValue ?? ""}
            onChange={(event) => {
              onAltChange(event.target.value);
            }}
            className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
          />
        </label>
      )}
    </div>
  );
}
