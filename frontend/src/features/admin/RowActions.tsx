"use client";

import { Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AdminResult } from "@/actions/admin";
import { cn } from "@/lib/cn";

type Props = {
  editHref: string;
  editLabel: string;
  deleteLabel: string;
  deleteConfirmLabel?: string;
  onDelete: () => Promise<AdminResult>;
  successMessage?: string;
  afterDeleteHref?: string;
};

/** Compact edit + delete icon controls for admin list rows/cards. */
export function RowActions({
  editHref,
  editLabel,
  deleteLabel,
  deleteConfirmLabel = "Confirm delete",
  onDelete,
  successMessage = "Deleted",
  afterDeleteHref,
}: Props) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="inline-flex items-center gap-1" data-no-row-nav onClick={(e) => e.stopPropagation()}>
      <Link
        href={editHref}
        aria-label={editLabel}
        title={editLabel}
        className="icon-btn text-ink-soft hover:bg-sand hover:text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <Pencil className="size-4" aria-hidden />
      </Link>
      <button
        type="button"
        aria-label={armed ? deleteConfirmLabel : deleteLabel}
        title={armed ? deleteConfirmLabel : deleteLabel}
        disabled={pending}
        className={cn(
          "icon-btn",
          armed ? "bg-danger text-white hover:bg-danger" : "text-danger hover:bg-danger-soft",
        )}
        onBlur={() => window.setTimeout(() => setArmed(false), 200)}
        onClick={(e) => {
          e.stopPropagation();
          if (!armed) return setArmed(true);
          startTransition(async () => {
            const result = await onDelete();
            setArmed(false);
            if (!result.ok) return void toast.error(result.message);
            toast.success(successMessage);
            if (afterDeleteHref !== undefined) router.push(afterDeleteHref);
            router.refresh();
          });
        }}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
