import { createHmac } from "node:crypto";
import { config } from "../../../platform/config.ts";
import { safeEqual } from "../../../platform/crypto.ts";
import type { Order } from "../../orders/orders.repo.ts";
import type { PaymentMethod } from "../methods.repo.ts";
import { endpointsFor } from "../methodSpecs.ts";
import { pktParts, postWithTimeout, safeJson, str, type Provider } from "./types.ts";

/**
 * JazzCash Hosted Checkout (Page Redirection v1.1).
 * pp_SecureHash = HMAC-SHA256(key = integrity salt,
 *   salt & value1 & value2 …) over every non-empty pp_* / ppmpf_* field,
 *   sorted by field name, uppercase hex.
 */
export function jazzcashHash(fields: Record<string, string>, salt: string): string {
  const values = Object.keys(fields)
    .filter((key) => (key.startsWith("pp_") || key.startsWith("ppmpf_")) && key !== "pp_SecureHash")
    .sort()
    .map((key) => fields[key] ?? "")
    .filter((value) => value.length > 0);
  return createHmac("sha256", salt).update([salt, ...values].join("&")).digest("hex").toUpperCase();
}

export function verifyJazzcashResponse(fields: Record<string, string>, salt: string): boolean {
  const received = (fields.pp_SecureHash ?? "").toUpperCase();
  return received.length === 64 && safeEqual(received, jazzcashHash(fields, salt));
}

/** 000 = success; 121 = transaction successful (inquiry); 124 = voucher pending. */
export function jazzcashStatus(code: string): "paid" | "pending" | "failed" {
  if (code === "000" || code === "121") return "paid";
  if (code === "124" || code === "157") return "pending";
  return "failed";
}

function stamp(date: Date): string {
  const p = pktParts(date);
  return `${p.y}${p.m}${p.d}${p.h}${p.i}${p.s}`;
}

export const jazzcash: Provider = {
  async start(order: Order, method: PaymentMethod, reference: string) {
    const now = new Date();
    const salt = method.config.integritySalt ?? "";
    const fields: Record<string, string> = {
      pp_Version: "1.1",
      pp_TxnType: "",
      pp_Language: "EN",
      pp_MerchantID: method.config.merchantId ?? "",
      pp_SubMerchantID: "",
      pp_Password: method.config.password ?? "",
      pp_BankID: "",
      pp_ProductID: "",
      pp_TxnRefNo: reference,
      pp_Amount: String(order.totalMinor),
      pp_TxnCurrency: "PKR",
      pp_TxnDateTime: stamp(now),
      pp_BillReference: order.number.replace("-", ""),
      pp_Description: `Embroidery designs ${order.number}`,
      pp_TxnExpiryDateTime: stamp(new Date(now.getTime() + 24 * 3_600_000)),
      pp_ReturnURL: `${config.SITE_URL}/hooks/jazzcash/return`,
      ppmpf_1: order.number,
      ppmpf_2: "",
      ppmpf_3: "",
      ppmpf_4: "",
      ppmpf_5: "",
    };
    fields.pp_SecureHash = jazzcashHash(fields, salt);
    return { action: endpointsFor("jazzcash", method.mode).checkout ?? "", method: "POST", fields };
  },

  async inquire(order: Order, method: PaymentMethod) {
    const reference = order.providerReference;
    if (reference === null) return { status: "unknown", amountMinor: null, txnId: null, message: "No JazzCash attempt yet", raw: null };
    const body: Record<string, string> = {
      pp_TxnRefNo: reference,
      pp_MerchantID: method.config.merchantId ?? "",
      pp_Password: method.config.password ?? "",
    };
    body.pp_SecureHash = jazzcashHash(body, method.config.integritySalt ?? "");
    const response = await postWithTimeout(endpointsFor("jazzcash", method.mode).inquiry ?? "", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = safeJson(response.text);
    if (json === null) return { status: "unknown", amountMinor: null, txnId: null, message: `JazzCash HTTP ${response.status}`, raw: response.text.slice(0, 500) };
    const responseCode = str(json.pp_ResponseCode);
    const paymentCode = str(json.pp_PaymentResponseCode) || responseCode;
    const status = responseCode === "000" ? jazzcashStatus(paymentCode) : "unknown";
    const amount = Number.parseInt(str(json.pp_Amount), 10);
    return {
      status,
      amountMinor: Number.isFinite(amount) ? amount : null,
      txnId: str(json.pp_RetreivalReferenceNo) || str(json.pp_AuthCode) || reference,
      message: str(json.pp_PaymentResponseMessage) || str(json.pp_ResponseMessage),
      raw: { ...json, pp_SecureHash: undefined },
    };
  },

  async test(method: PaymentMethod) {
    try {
      const fake = { providerReference: `T${stamp(new Date())}00000` } as Order;
      const result = await jazzcash.inquire(fake, method);
      const raw = result.raw as Record<string, unknown> | null;
      const code = raw === null ? "" : str(raw.pp_ResponseCode);
      // Any structured reply other than an auth failure means credentials + hash are accepted.
      if (code.length > 0 && code !== "110" && code !== "115") {
        return { ok: true, message: `JazzCash answered (${method.mode}, code ${code}: ${result.message})` };
      }
      return { ok: false, message: `JazzCash did not accept the credentials: ${result.message || "no response code"}` };
    } catch (error) {
      return { ok: false, message: `Could not reach JazzCash: ${(error as Error).message}` };
    }
  },
};
