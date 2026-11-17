import { createCipheriv } from "node:crypto";
import { config } from "../../../platform/config.ts";
import type { Order } from "../../orders/orders.repo.ts";
import type { PaymentMethod } from "../methods.repo.ts";
import { endpointsFor } from "../methodSpecs.ts";
import { pktParts, postWithTimeout, safeJson, str, type Provider } from "./types.ts";

/**
 * Easypaisa "Easypay" hosted checkout (Index.jsf → auth_token → Confirm.jsf).
 * merchantHashedReq = base64(AES-ECB-PKCS5(hashKey, "k1=v1&k2=v2…")) over the
 * non-empty request fields sorted by name. The final result is always
 * re-confirmed with the inquire-transaction API before an order is paid.
 */
export function easypaisaHashedRequest(fields: Record<string, string>, hashKey: string): string {
  const plain = Object.keys(fields)
    .filter((key) => key !== "merchantHashedReq" && (fields[key] ?? "").length > 0)
    .sort()
    .map((key) => `${key}=${fields[key] ?? ""}`)
    .join("&");
  const key = Buffer.from(hashKey, "utf8");
  const algorithm = key.length === 32 ? "aes-256-ecb" : key.length === 24 ? "aes-192-ecb" : "aes-128-ecb";
  const cipher = createCipheriv(algorithm, key, null);
  return Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]).toString("base64");
}

export const easypaisaReturnUrl = () => `${config.SITE_URL}/hooks/easypaisa/return`;

function mobile(phone: string): string {
  const digits = phone.replaceAll(/\D/g, "");
  if (digits.startsWith("92") && digits.length === 12) return `0${digits.slice(2)}`;
  return digits.length === 11 && digits.startsWith("03") ? digits : "";
}

export const easypaisa: Provider = {
  async start(order: Order, method: PaymentMethod, reference: string) {
    const expiry = pktParts(new Date(Date.now() + 24 * 3_600_000));
    const fields: Record<string, string> = {
      storeId: method.config.storeId ?? "",
      amount: (order.totalMinor / 100).toFixed(1),
      postBackURL: easypaisaReturnUrl(),
      orderRefNum: reference,
      expiryDate: `${expiry.y}${expiry.m}${expiry.d} ${expiry.h}${expiry.i}${expiry.s}`,
      autoRedirect: "1",
      paymentMethod: "",
      emailAddr: order.customerEmail,
      mobileNum: mobile(order.customerPhone),
    };
    fields.merchantHashedReq = easypaisaHashedRequest(fields, method.config.hashKey ?? "");
    return { action: endpointsFor("easypaisa", method.mode).index ?? "", method: "POST", fields };
  },

  async inquire(order: Order, method: PaymentMethod) {
    const reference = order.providerReference;
    if (reference === null) return { status: "unknown", amountMinor: null, txnId: null, message: "No Easypaisa attempt yet", raw: null };
    const credentials = Buffer.from(`${method.config.apiUsername ?? ""}:${method.config.apiPassword ?? ""}`).toString("base64");
    const response = await postWithTimeout(endpointsFor("easypaisa", method.mode).inquiry ?? "", {
      headers: { "content-type": "application/json", Credentials: credentials },
      body: JSON.stringify({ orderId: reference, storeId: method.config.storeId ?? "", accountNum: method.config.accountNumber ?? "" }),
    });
    const json = safeJson(response.text);
    if (json === null) return { status: "unknown", amountMinor: null, txnId: null, message: `Easypaisa HTTP ${response.status}`, raw: response.text.slice(0, 500) };

    const responseCode = str(json.responseCode);
    const txStatus = str(json.transactionStatus).toUpperCase();
    const amount = Number.parseFloat(str(json.transactionAmount));
    const status =
      responseCode !== "0000" ? "unknown" : txStatus === "PAID" ? "paid" : txStatus === "PENDING" ? "pending" : txStatus.length > 0 ? "failed" : "unknown";
    return {
      status,
      amountMinor: Number.isFinite(amount) ? Math.round(amount * 100) : null,
      txnId: str(json.transactionId) || reference,
      message: str(json.responseDesc) || txStatus,
      raw: json,
    };
  },

  async test(method: PaymentMethod) {
    try {
      const result = await easypaisa.inquire({ providerReference: `TEST${Date.now()}` } as Order, method);
      const raw = result.raw as Record<string, unknown> | null;
      const code = raw === null || typeof raw !== "object" ? "" : str(raw.responseCode);
      if (code.length > 0 && code !== "0001" && code !== "0002") {
        return { ok: true, message: `Easypaisa answered (${method.mode}, code ${code}: ${result.message})` };
      }
      return { ok: false, message: `Easypaisa did not accept the API credentials: ${result.message || "no response"}` };
    } catch (error) {
      return { ok: false, message: `Could not reach Easypaisa: ${(error as Error).message}` };
    }
  },
};
