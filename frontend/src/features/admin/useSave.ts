"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { AdminResult } from "@/actions/admin";

/** Runs an admin action with toast feedback and refreshes server data on success. */
export function useSave() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const save = (work: () => Promise<AdminResult>, success = "Saved", after?: (data: unknown) => void) =>
    startTransition(async () => {
      const result = await work();
      if (!result.ok) {
        const first = result.fields === undefined ? undefined : Object.entries(result.fields)[0];
        toast.error(first === undefined ? result.message : `${result.message}: ${first[0]} — ${first[1]}`);
        return;
      }
      toast.success(success);
      after?.(result.data);
      router.refresh();
    });
  return { save, pending };
}
