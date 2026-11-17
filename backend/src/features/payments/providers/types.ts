import type { Order } from "../../orders/orders.repo.ts";
import type { PaymentMethod } from "../methods.repo.ts";

/** Browser must POST these fields to `action` (the provider's hosted page). */
export type RedirectForm = { action: string; method: "POST"; fields: Record<string, string> };

export type InquiryResult = {
  status: "paid" | "pending" | "failed" | "unknown";
  amountMinor: number | null;
  txnId: string | null;
  message: string;
  raw: unknown;
};

export type TestResult = { ok: boolean; message: string };

export type Provider = {
  start(order: Order, method: PaymentMethod, reference: string): Promise<RedirectForm>;
  /** Server-to-server status check, used on return and by admin "Re-check". */
  inquire(order: Order, method: PaymentMethod): Promise<InquiryResult>;
  test(method: PaymentMethod): Promise<TestResult>;
};

const TIMEOUT_MS = 15_000;

/** fetch with a deadline; returns status + raw text, never throws on HTTP errors. */
export async function postWithTimeout(
  url: string,
  init: { headers: Record<string, string>; body: string },
): Promise<{ status: number; text: string }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "user-agent": "EmbroideryStore/1.0", ...init.headers },
    body: init.body,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "error",
  });
  return { status: response.status, text: (await response.text()).slice(0, 20_000) };
}

export function safeJson(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function str(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

/** Pakistan time parts (providers expect local PKT timestamps). */
export function pktParts(date: Date): Record<"y" | "m" | "d" | "h" | "i" | "s", string> {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour"), i: get("minute"), s: get("second") };
}
