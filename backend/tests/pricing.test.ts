import assert from "node:assert/strict";
import { test } from "node:test";
import { checkCoupon, computeTotals, type CouponRule } from "../src/features/orders/pricing.ts";

const coupon = (overrides: Partial<CouponRule> = {}): CouponRule => ({
  code: "EID20",
  kind: "percent",
  value: 20,
  minSubtotalMinor: 0,
  maxUses: null,
  usedCount: 0,
  startsAt: null,
  endsAt: null,
  isActive: true,
  ...overrides,
});

test("uses sale price when present", () => {
  const totals = computeTotals([{ priceMinor: 299900, salePriceMinor: 199900 }, { priceMinor: 100000, salePriceMinor: null }], null);
  assert.deepEqual(totals, { subtotalMinor: 299900, discountMinor: 0, totalMinor: 299900 });
});

test("percent coupon rounds down and never exceeds subtotal", () => {
  assert.equal(computeTotals([{ priceMinor: 999, salePriceMinor: null }], coupon()).discountMinor, 199);
  assert.equal(computeTotals([{ priceMinor: 500, salePriceMinor: null }], coupon({ kind: "fixed", value: 900 })).totalMinor, 0);
});

test("coupon rules", () => {
  const now = new Date("2026-11-17T10:00:00Z");
  assert.deepEqual(checkCoupon(coupon({ isActive: false }), 1000, now), { ok: false, reason: "inactive" });
  assert.deepEqual(checkCoupon(coupon({ endsAt: new Date("2026-11-01") }), 1000, now), { ok: false, reason: "expired" });
  assert.deepEqual(checkCoupon(coupon({ maxUses: 3, usedCount: 3 }), 1000, now), { ok: false, reason: "used_up" });
  assert.deepEqual(checkCoupon(coupon({ minSubtotalMinor: 5000 }), 1000, now), { ok: false, reason: "min_subtotal" });
  assert.deepEqual(checkCoupon(coupon(), 1000, now), { ok: true });
});
