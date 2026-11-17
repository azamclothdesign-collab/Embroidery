"use client";

import { Check } from "lucide-react";
import { markMessageReadAction } from "@/actions/admin";
import { useSave } from "./useSave";

export function MarkReadButton({ id }: { id: string }) {
  const { save, pending } = useSave();
  return (
    <button type="button" className="btn btn-ghost min-h-9 px-3" disabled={pending} onClick={() => save(() => markMessageReadAction(id), "Marked as read")}>
      <Check className="size-4" aria-hidden /> Mark as read
    </button>
  );
}
