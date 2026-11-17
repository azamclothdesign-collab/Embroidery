export type PricedItem = { priceMinor: number; salePriceMinor: number | null };

export type CouponRule = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  minSubtotalMinor: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

export type Totals = { subtotalMinor: number; discountMinor: number; totalMinor: number };

export type CouponCheck = { ok: true } | { ok: false; reason: "inactive" | "not_started" | "expired" | "used_up" | "min_subtotal" };

export function unitPrice(item: PricedItem): number {
  return item.salePriceMinor ?? item.priceMinor;
}

export function checkCoupon(coupon: CouponRule, subtotalMinor: number, now: Date): CouponCheck {
  if (!coupon.isActive) return { ok: false, reason: "inactive" };
  if (coupon.startsAt !== null && coupon.startsAt > now) return { ok: false, reason: "not_started" };
  if (coupon.endsAt !== null && coupon.endsAt < now) return { ok: false, reason: "expired" };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return { ok: false, reason: "used_up" };
  if (subtotalMinor < coupon.minSubtotalMinor) return { ok: false, reason: "min_subtotal" };
  return { ok: true };
}

/** All money math happens here, server-side, in integer minor units (paisa). */
export function computeTotals(items: PricedItem[], coupon: CouponRule | null): Totals {
  const subtotalMinor = items.reduce((sum, item) => sum + unitPrice(item), 0);
  let discountMinor = 0;
  if (coupon !== null) {
    discountMinor =
      coupon.kind === "percent" ? Math.floor((subtotalMinor * Math.min(coupon.value, 100)) / 100) : coupon.value;
  }
  discountMinor = Math.min(Math.max(discountMinor, 0), subtotalMinor);
  return { subtotalMinor, discountMinor, totalMinor: subtotalMinor - discountMinor };
}
