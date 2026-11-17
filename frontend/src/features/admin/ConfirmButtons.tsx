"use client";

import { Archive, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import {
  archiveProductAction,
  deleteCategoryAction,
  deleteCouponAction,
  deletePageAction,
  deleteProductAction,
  type AdminResult,
} from "@/actions/admin";
import { cn } from "@/lib/cn";

/** Two-step inline confirmation (no blocking browser dialogs). */
export function ConfirmAction({
  label,
  confirmLabel,
  icon,
  run,
  onDone,
  className,
  successMessage = "Done",
}: {
  label: string;
  confirmLabel: string;
  icon?: ReactNode;
  run: () => Promise<AdminResult>;
  onDone?: () => void;
  className?: string;
  successMessage?: string;
}) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <span className="inline-flex gap-1">
      <button
        type="button"
        disabled={pending}
        onBlur={() => window.setTimeout(() => setArmed(false), 200)}
        onClick={() => {
          if (!armed) return setArmed(true);
          startTransition(async () => {
            const result = await run();
            setArmed(false);
            if (!result.ok) return void toast.error(result.message);
            toast.success(successMessage);
            onDone?.();
          });
        }}
        className={cn("btn btn-outline", armed && "border-danger bg-danger text-white hover:bg-danger", className)}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
        {armed ? confirmLabel : label}
      </button>
    </span>
  );
}

export function ArchiveProductButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <ConfirmAction
      label="Archive"
      confirmLabel="Confirm archive"
      icon={<Archive className="size-4" aria-hidden />}
      run={() => archiveProductAction(id)}
      successMessage="Design archived"
      onDone={() => router.refresh()}
    />
  );
}

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <ConfirmAction
      label="Delete"
      confirmLabel="Delete permanently"
      icon={<Trash2 className="size-4" aria-hidden />}
      className="text-danger"
      run={() => deleteProductAction(id)}
      successMessage="Design deleted"
      onDone={() => {
        router.push("/admin/products");
        router.refresh();
      }}
    />
  );
}

export function DeleteButton({
  kind,
  id,
  redirectTo,
}: {
  kind: "category" | "coupon" | "page";
  id: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const run = kind === "category" ? () => deleteCategoryAction(id) : kind === "coupon" ? () => deleteCouponAction(id) : () => deletePageAction(id);
  return (
    <ConfirmAction
      label="Delete"
      confirmLabel={kind === "category" ? "Delete category + designs" : "Confirm delete"}
      icon={<Trash2 className="size-4" aria-hidden />}
      className="text-danger"
      run={run}
      successMessage={kind === "category" ? "Category deleted" : "Deleted"}
      onDone={() => (redirectTo !== undefined ? router.push(redirectTo) : router.refresh())}
    />
  );
}
