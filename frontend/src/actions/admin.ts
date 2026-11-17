"use server";

import { unstable_rethrow } from "next/navigation";
import { adminApi } from "@/features/admin/adminApi";
import { ApiError } from "@/lib/api.server";
import type { ActionError } from "./store";

export type AdminResult<T = unknown> = ({ ok: true } & { data: T }) | ActionError;

async function run<T>(work: () => Promise<T>): Promise<AdminResult<T>> {
  try {
    return { ok: true, data: await work() };
  } catch (error) {
    // Let Next.js redirects (expired session) propagate untouched.
    unstable_rethrow(error);
    if (error instanceof ApiError) {
      return {
        ok: false,
        code: error.problem.code,
        message: error.problem.title,
        ...(error.problem.fields === undefined ? {} : { fields: error.problem.fields }),
      };
    }
    console.error(error);
    return { ok: false, code: "unexpected", message: "Something went wrong. Please try again." };
  }
}

const UUID = /^[0-9a-f-]{36}$/i;
const ORDER = /^EMB-[0-9A-Z]{10}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const assert = (ok: boolean) => {
  if (!ok) throw new ApiError({ status: 400, code: "bad_request", title: "Invalid request" });
};

// ---------- Catalog ----------
export async function saveCategoryAction(id: string | null, input: unknown) {
  return run(async () => {
    if (id !== null) assert(UUID.test(id));
    return adminApi<{ id: string }>(id === null ? "/v1/admin/categories" : `/v1/admin/categories/${id}`, {
      method: id === null ? "POST" : "PUT",
      body: input,
    });
  });
}

export async function deleteCategoryAction(id: string) {
  return run(async () => {
    assert(UUID.test(id));
    await adminApi(`/v1/admin/categories/${id}`, { method: "DELETE" });
  });
}

export async function reorderCategoriesAction(ids: string[]) {
  return run(async () => {
    assert(ids.every((id) => UUID.test(id)));
    await adminApi("/v1/admin/categories/reorder", { method: "POST", body: { ids } });
  });
}

export async function saveProductAction(id: string | null, input: unknown) {
  return run(async () => {
    if (id !== null) assert(UUID.test(id));
    return adminApi<{ id: string }>(id === null ? "/v1/admin/products" : `/v1/admin/products/${id}`, {
      method: id === null ? "POST" : "PUT",
      body: input,
    });
  });
}

export async function archiveProductAction(id: string) {
  return run(async () => {
    assert(UUID.test(id));
    await adminApi(`/v1/admin/products/${id}/archive`, { method: "POST" });
  });
}

export async function deleteProductAction(id: string) {
  return run(async () => {
    assert(UUID.test(id));
    await adminApi(`/v1/admin/products/${id}`, { method: "DELETE" });
  });
}

export async function bulkProductsAction(ids: string[], status: "draft" | "published" | "archived") {
  return run(async () => {
    assert(ids.every((id) => UUID.test(id)));
    return adminApi<{ changed: number }>("/v1/admin/products/bulk", { method: "POST", body: { ids, status } });
  });
}

// ---------- Orders ----------
type OrderOp =
  | { kind: "mark-paid" }
  | { kind: "status"; status: "cancelled" | "refunded" | "failed" }
  | { kind: "resend" }
  | { kind: "reset-downloads" }
  | { kind: "recheck" }
  | { kind: "proof"; proofId: string; decision: "approve" | "reject" };

export async function orderAction(number: string, op: OrderOp) {
  return run(async () => {
    assert(ORDER.test(number));
    const base = `/v1/admin/orders/${number}`;
    switch (op.kind) {
      case "status":
        return adminApi<unknown>(`${base}/status`, { method: "POST", body: { status: op.status } });
      case "proof":
        assert(UUID.test(op.proofId));
        return adminApi<unknown>(`${base}/proofs/${op.proofId}/${op.decision}`, { method: "POST" });
      case "recheck":
        return adminApi<{ status: string; message: string }>(`${base}/recheck`, { method: "POST", timeoutMs: 20_000 });
      default:
        return adminApi<unknown>(`${base}/${op.kind}`, { method: "POST" });
    }
  });
}

export async function deleteOrderAction(number: string) {
  return run(async () => {
    assert(ORDER.test(number));
    await adminApi(`/v1/admin/orders/${number}`, { method: "DELETE" });
  });
}

// ---------- Coupons ----------
export async function saveCouponAction(id: string | null, input: unknown) {
  return run(async () => {
    if (id !== null) assert(UUID.test(id));
    return adminApi(id === null ? "/v1/admin/coupons" : `/v1/admin/coupons/${id}`, { method: id === null ? "POST" : "PUT", body: input });
  });
}

export async function deleteCouponAction(id: string) {
  return run(async () => {
    assert(UUID.test(id));
    await adminApi(`/v1/admin/coupons/${id}`, { method: "DELETE" });
  });
}

// ---------- Content ----------
export async function saveSettingAction(key: "store" | "home" | "announcement" | "faq" | "seo", value: unknown) {
  return run(async () => {
    assert(["store", "home", "announcement", "faq", "seo"].includes(key));
    await adminApi(`/v1/admin/settings/${key}`, { method: "PUT", body: value });
  });
}

export async function saveSmtpAction(value: unknown) {
  return run(() => adminApi("/v1/admin/settings/smtp", { method: "PUT", body: value }));
}

export async function testSmtpAction() {
  return run(() => adminApi<{ ok: boolean; message: string }>("/v1/admin/settings/smtp/test", { method: "POST", timeoutMs: 20_000 }));
}

export async function savePageAction(originalSlug: string, input: unknown) {
  return run(async () => {
    assert(SLUG.test(originalSlug));
    return adminApi<{ slug: string }>(`/v1/admin/pages/${originalSlug}`, { method: "PUT", body: input });
  });
}

export async function deletePageAction(slug: string) {
  return run(async () => {
    assert(SLUG.test(slug));
    await adminApi(`/v1/admin/pages/${slug}`, { method: "DELETE" });
  });
}

export async function markMessageReadAction(id: string) {
  return run(async () => {
    assert(UUID.test(id));
    await adminApi(`/v1/admin/messages/${id}/read`, { method: "POST" });
  });
}

export async function deleteMessageAction(id: string) {
  return run(async () => {
    assert(UUID.test(id));
    await adminApi(`/v1/admin/messages/${id}`, { method: "DELETE" });
  });
}

// ---------- Payments ----------
const METHODS = ["payfast", "jazzcash", "easypaisa", "bank", "cod"];

export async function saveMethodAction(code: string, input: unknown) {
  return run(async () => {
    assert(METHODS.includes(code));
    return adminApi(`/v1/admin/payment-methods/${code}`, { method: "PUT", body: input });
  });
}

export async function testMethodAction(code: string) {
  return run(async () => {
    assert(METHODS.includes(code));
    return adminApi<{ ok: boolean; message: string }>(`/v1/admin/payment-methods/${code}/test`, { method: "POST", timeoutMs: 25_000 });
  });
}
