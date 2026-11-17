import type { Metadata } from "next";
import { adminApi } from "@/features/admin/adminApi";
import { CouponManager, type Coupon } from "@/features/admin/CouponManager";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const { items } = await adminApi<{ items: Coupon[] }>("/v1/admin/coupons");
  return (
    <>
      <PageHeader title="Coupons" description="Discount codes customers enter in the cart. Prices are always recalculated on the server." />
      <CouponManager coupons={items} />
    </>
  );
}
