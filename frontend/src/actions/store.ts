"use server";

import { ApiError, api } from "@/lib/api.server";
import { getOrderToken, rememberOrderToken } from "@/lib/session.server";
import type { Quote, RedirectForm } from "@/lib/types";

export type ActionError = { ok: false; code: string; message: string; fields?: Record<string, string> };

function toError(error: unknown): ActionError {
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

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const cleanItems = (items: unknown): string[] =>
  Array.isArray(items) ? [...new Set(items.filter((item): item is string => typeof item === "string" && SLUG.test(item)))].slice(0, 50) : [];
const cleanCoupon = (code: unknown): string | null =>
  typeof code === "string" && /^[A-Za-z0-9_-]{3,32}$/.test(code.trim()) ? code.trim().toUpperCase() : null;

export async function quoteAction(items: string[], couponCode: string | null): Promise<({ ok: true } & Quote) | ActionError> {
  const slugs = cleanItems(items);
  if (slugs.length === 0) return { ok: false, code: "empty", message: "Cart is empty" };
  try {
    const quote = await api<Quote>("/v1/checkout/quote", { method: "POST", body: { items: slugs, couponCode: cleanCoupon(couponCode) } });
    return { ok: true, ...quote };
  } catch (error) {
    return toError(error);
  }
}

export type PlaceOrderResult = { ok: true; number: string; payment: RedirectForm | null; paymentError: string | null } | ActionError;

export async function placeOrderAction(input: {
  items: string[];
  name: string;
  email: string;
  phone: string;
  method: string;
  couponCode: string | null;
  locale: "en" | "ur";
  idempotencyKey: string;
}): Promise<PlaceOrderResult> {
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(input.idempotencyKey)) {
    return { ok: false, code: "bad_request", message: "Please reload the page and try again." };
  }
  try {
    const created = await api<{ number: string; accessToken: string }>("/v1/orders", {
      method: "POST",
      idempotencyKey: input.idempotencyKey,
      body: {
        items: cleanItems(input.items),
        name: String(input.name).slice(0, 80),
        email: String(input.email).slice(0, 254),
        phone: String(input.phone).slice(0, 30),
        method: input.method,
        couponCode: cleanCoupon(input.couponCode),
        locale: input.locale === "ur" ? "ur" : "en",
      },
    });
    await rememberOrderToken(created.number, created.accessToken);

    if (input.method === "bank" || input.method === "cod") {
      return { ok: true, number: created.number, payment: null, paymentError: null };
    }
    try {
      const form = await api<RedirectForm>(`/v1/orders/${created.number}/pay`, {
        method: "POST",
        body: { token: created.accessToken },
        timeoutMs: 20_000,
      });
      return { ok: true, number: created.number, payment: form, paymentError: null };
    } catch (error) {
      return { ok: true, number: created.number, payment: null, paymentError: toError(error).message };
    }
  } catch (error) {
    return toError(error);
  }
}

export async function startPaymentAction(number: string): Promise<({ ok: true } & RedirectForm) | ActionError> {
  if (!/^EMB-[0-9A-Z]{10}$/.test(number)) return { ok: false, code: "not_found", message: "Order not found" };
  const token = await getOrderToken(number);
  if (token === null) return { ok: false, code: "no_access", message: "Open the link from your email to pay for this order." };
  try {
    const form = await api<RedirectForm>(`/v1/orders/${number}/pay`, { method: "POST", body: { token }, timeoutMs: 20_000 });
    return { ok: true, ...form };
  } catch (error) {
    return toError(error);
  }
}

export async function trackAction(_: unknown, formData: FormData): Promise<{ ok: true } | ActionError> {
  try {
    await api("/v1/orders/lookup", {
      method: "POST",
      body: { number: String(formData.get("number") ?? "").trim().toUpperCase(), email: String(formData.get("email") ?? "").trim() },
    });
    return { ok: true };
  } catch (error) {
    return toError(error);
  }
}

export async function contactAction(_: unknown, formData: FormData): Promise<{ ok: true } | ActionError> {
  // Honeypot: real visitors never fill the hidden "website" field.
  if (String(formData.get("website") ?? "").length > 0) return { ok: true };
  try {
    await api("/v1/contact", {
      method: "POST",
      body: {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        message: String(formData.get("message") ?? ""),
      },
    });
    return { ok: true };
  } catch (error) {
    return toError(error);
  }
}
