"use client";

import { Loader2, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { saveCouponAction } from "@/actions/admin";
import { DeleteButton } from "./ConfirmButtons";
import { TextField, Toggle, fromMinor, toMinor } from "./fields";
import { StatusBadge, rupees } from "./ui";
import { useSave } from "./useSave";

export type Coupon = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: number;
  minSubtotalMinor: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

const toLocal = (iso: string | null) => (iso === null ? "" : new Date(iso).toISOString().slice(0, 16));
const fromLocal = (value: string) => (value === "" ? null : new Date(value).toISOString());

function CouponEditor({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const { save, pending } = useSave();
  const [v, setV] = useState({
    code: coupon?.code ?? "",
    kind: coupon?.kind ?? ("percent" as const),
    value: coupon === null ? "10" : coupon.kind === "fixed" ? fromMinor(coupon.value) : String(coupon.value),
    min: coupon === null ? "" : fromMinor(coupon.minSubtotalMinor || null),
    maxUses: coupon?.maxUses == null ? "" : String(coupon.maxUses),
    startsAt: toLocal(coupon?.startsAt ?? null),
    endsAt: toLocal(coupon?.endsAt ?? null),
    isActive: coupon?.isActive ?? true,
  });
  const submit = () => {
    const value = v.kind === "fixed" ? (toMinor(v.value) ?? 0) : Number.parseInt(v.value || "0", 10);
    save(
      () =>
        saveCouponAction(coupon?.id ?? null, {
          code: v.code,
          kind: v.kind,
          value,
          minSubtotalMinor: v.min === "" ? 0 : (toMinor(v.min) ?? 0),
          maxUses: v.maxUses === "" ? null : Number.parseInt(v.maxUses, 10),
          startsAt: fromLocal(v.startsAt),
          endsAt: fromLocal(v.endsAt),
          isActive: v.isActive,
        }),
      "Coupon saved",
      onClose,
    );
  };
  return (
    <div className="card mb-6 space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg">{coupon === null ? "New coupon" : `Edit ${coupon.code}`}</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><X className="size-5" aria-hidden /></button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TextField id="c-code" label="Code" required dir="ltr" value={v.code} maxLength={32} onChange={(x) => setV((c) => ({ ...c, code: x.toUpperCase().replaceAll(/[^A-Z0-9_-]/g, "") }))} />
        <div>
          <label htmlFor="c-kind" className="field-label">Type</label>
          <select id="c-kind" className="field" value={v.kind} onChange={(e) => setV((c) => ({ ...c, kind: e.target.value as "percent" | "fixed" }))}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off (Rs)</option>
          </select>
        </div>
        <TextField id="c-value" label={v.kind === "percent" ? "Percent (1–100)" : "Amount (Rs)"} dir="ltr" value={v.value} onChange={(x) => setV((c) => ({ ...c, value: x }))} />
        <TextField id="c-min" label="Minimum cart (Rs)" dir="ltr" value={v.min} help="Optional" onChange={(x) => setV((c) => ({ ...c, min: x }))} />
        <TextField id="c-max" label="Max uses" type="number" dir="ltr" value={v.maxUses} help="Empty = unlimited" onChange={(x) => setV((c) => ({ ...c, maxUses: x.replaceAll(/\D/g, "") }))} />
        <div className="flex items-end pb-2">
          <Toggle id="c-active" label="Active" checked={v.isActive} onChange={(x) => setV((c) => ({ ...c, isActive: x }))} />
        </div>
        <TextField id="c-start" label="Starts (optional)" type="datetime-local" value={v.startsAt} onChange={(x) => setV((c) => ({ ...c, startsAt: x }))} />
        <TextField id="c-end" label="Ends (optional)" type="datetime-local" value={v.endsAt} onChange={(x) => setV((c) => ({ ...c, endsAt: x }))} />
      </div>
      <button type="button" className="btn btn-primary" disabled={pending} onClick={submit}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />} Save coupon
      </button>
    </div>
  );
}

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);
  return (
    <>
      {editing === null ? (
        <button type="button" className="btn btn-primary mb-6" onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden /> New coupon
        </button>
      ) : (
        <CouponEditor key={editing === "new" ? "new" : editing.id} coupon={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
      {coupons.length === 0 ? (
        <p className="card px-6 py-10 text-center text-ink-soft">No coupons yet. Create one for Eid, sales or loyal customers.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">Code</th>
                <th className="px-3 py-3 text-start font-semibold">Discount</th>
                <th className="px-3 py-3 text-start font-semibold">Used</th>
                <th className="px-3 py-3 text-start font-semibold">Ends</th>
                <th className="px-3 py-3 text-start font-semibold">Status</th>
                <th className="px-4 py-3 text-end font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold">{coupon.code}</td>
                  <td className="px-3 py-3">{coupon.kind === "percent" ? `${coupon.value}%` : rupees(coupon.value)}{coupon.minSubtotalMinor > 0 ? ` · min ${rupees(coupon.minSubtotalMinor)}` : ""}</td>
                  <td className="px-3 py-3">{coupon.usedCount}{coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}</td>
                  <td className="px-3 py-3 text-ink-soft">{coupon.endsAt === null ? "—" : new Date(coupon.endsAt).toLocaleDateString("en-PK")}</td>
                  <td className="px-3 py-3"><StatusBadge status={coupon.isActive ? "published" : "draft"} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" className="btn btn-outline min-h-9 px-3" onClick={() => setEditing(coupon)}>Edit</button>
                      <DeleteButton kind="coupon" id={coupon.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
