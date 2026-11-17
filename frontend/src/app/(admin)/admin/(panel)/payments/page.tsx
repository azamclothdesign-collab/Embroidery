import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { MethodCard, type AdminMethod } from "@/features/admin/MethodCard";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const { items } = await adminApi<{ items: AdminMethod[] }>("/v1/admin/payment-methods");
  const active = items.filter((m) => m.enabled).length;
  return (
    <>
      <PageHeader title="Payment methods" description={`${active} of ${items.length} active. Turn on any combination — customers only see active, fully configured methods.`} />
      <p className="mb-6 flex items-start gap-3 rounded-2xl bg-teal-soft px-4 py-3 text-sm text-teal">
        <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
        <span>
          API keys are encrypted (AES-256) before they are stored and are never shown again or sent to the browser. Gateway addresses are fixed in code, so
          payments can only go to the real PayFast, JazzCash or Easypaisa. Test in <strong>Sandbox</strong> first, then switch to <strong>Live</strong>.
        </span>
      </p>
      <div className="grid gap-6 2xl:grid-cols-2">
        {items.map((method) => (
          <MethodCard key={`${method.code}-${method.enabled}-${method.mode}-${method.missing.length}`} method={method} />
        ))}
      </div>
    </>
  );
}
