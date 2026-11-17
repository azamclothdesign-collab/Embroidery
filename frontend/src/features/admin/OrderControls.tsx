"use client";

import { Ban, CheckCircle2, Loader2, Mail, RefreshCcw, RotateCcw, Trash2, Undo2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { deleteOrderAction, orderAction } from "@/actions/admin";

type Op = Parameters<typeof orderAction>[1];

function useOrderOp(number: string) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const run = (key: string, op: Op, success: string) =>
    startTransition(async () => {
      setBusy(key);
      const result = await orderAction(number, op);
      setBusy(null);
      if (!result.ok) return void toast.error(result.message);
      const data = result.data as { status?: string; message?: string; sent?: boolean } | undefined;
      if (op.kind === "recheck") toast.info(`Provider says: ${data?.status ?? "unknown"}${data?.message ? ` — ${data.message}` : ""}`);
      else if (op.kind === "resend" && data?.sent === false) toast.warning("Link created, but email is not configured or failed. Check Settings → Email.");
      else toast.success(success);
      router.refresh();
    });
  return { run, pending, busy, startTransition, setBusy, router };
}

function OpButton({ id, busy, pending, onClick, icon, children, tone = "outline" }: { id: string; busy: string | null; pending: boolean; onClick: () => void; icon: ReactNode; children: ReactNode; tone?: "outline" | "primary" | "danger" }) {
  const cls = tone === "primary" ? "btn btn-primary" : tone === "danger" ? "btn btn-outline text-danger" : "btn btn-outline";
  return (
    <button type="button" className={`${cls} w-full justify-start`} disabled={pending} onClick={onClick}>
      {busy === id ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function OrderControls({ number, status, method }: { number: string; status: string; method: string }) {
  const { run, pending, busy, startTransition, setBusy, router } = useOrderOp(number);
  const [confirm, setConfirm] = useState<string | null>(null);
  const guarded = (key: string, fn: () => void) => () => {
    if (confirm !== key) return setConfirm(key);
    setConfirm(null);
    fn();
  };
  const paid = status === "paid";
  const gateway = ["payfast", "jazzcash", "easypaisa"].includes(method);

  return (
    <div className="space-y-2">
      {!paid && status !== "refunded" && (
        <OpButton id="paid" busy={busy} pending={pending} tone="primary" icon={<CheckCircle2 className="size-4" aria-hidden />} onClick={guarded("paid", () => run("paid", { kind: "mark-paid" }, "Marked as paid — customer emailed"))}>
          {confirm === "paid" ? "Click again to confirm payment received" : "Mark as paid"}
        </OpButton>
      )}
      {gateway && !paid && (
        <OpButton id="recheck" busy={busy} pending={pending} icon={<RefreshCcw className="size-4" aria-hidden />} onClick={() => run("recheck", { kind: "recheck" }, "")}>
          Re-check with {method}
        </OpButton>
      )}
      <OpButton id="resend" busy={busy} pending={pending} icon={<Mail className="size-4" aria-hidden />} onClick={() => run("resend", { kind: "resend" }, "Email sent to customer")}>
        Email order link to customer
      </OpButton>
      {paid && (
        <OpButton id="reset" busy={busy} pending={pending} icon={<RotateCcw className="size-4" aria-hidden />} onClick={() => run("reset", { kind: "reset-downloads" }, "Download counters reset")}>
          Reset download limit
        </OpButton>
      )}
      {paid ? (
        <OpButton id="refund" busy={busy} pending={pending} tone="danger" icon={<Undo2 className="size-4" aria-hidden />} onClick={guarded("refund", () => run("refund", { kind: "status", status: "refunded" }, "Marked refunded — downloads blocked"))}>
          {confirm === "refund" ? "Click again: mark refunded" : "Mark refunded (blocks downloads)"}
        </OpButton>
      ) : (
        status !== "cancelled" &&
        status !== "refunded" && (
          <OpButton id="cancel" busy={busy} pending={pending} tone="danger" icon={<Ban className="size-4" aria-hidden />} onClick={guarded("cancel", () => run("cancel", { kind: "status", status: "cancelled" }, "Order cancelled"))}>
            {confirm === "cancel" ? "Click again to cancel order" : "Cancel order"}
          </OpButton>
        )
      )}
      <OpButton
        id="delete"
        busy={busy}
        pending={pending}
        tone="danger"
        icon={<Trash2 className="size-4" aria-hidden />}
        onClick={guarded("delete", () =>
          startTransition(async () => {
            setBusy("delete");
            const result = await deleteOrderAction(number);
            setBusy(null);
            if (!result.ok) return void toast.error(result.message);
            toast.success("Order deleted");
            router.push("/admin/orders");
            router.refresh();
          }),
        )}
      >
        {confirm === "delete" ? "Click again to permanently delete" : "Delete order"}
      </OpButton>
    </div>
  );
}

export function ProofReview({ number, proofId }: { number: string; proofId: string }) {
  const { run, pending, busy } = useOrderOp(number);
  return (
    <div className="flex gap-2">
      <button type="button" className="btn btn-primary min-h-10 flex-1" disabled={pending} onClick={() => run("approve", { kind: "proof", proofId, decision: "approve" }, "Receipt approved — order paid, customer emailed")}>
        {busy === "approve" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <CheckCircle2 className="size-4" aria-hidden />} Approve
      </button>
      <button type="button" className="btn btn-outline min-h-10 flex-1 text-danger" disabled={pending} onClick={() => run("reject", { kind: "proof", proofId, decision: "reject" }, "Receipt rejected")}>
        {busy === "reject" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <XCircle className="size-4" aria-hidden />} Reject
      </button>
    </div>
  );
}
