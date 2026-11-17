import { randomToken, safeEqual, sha256Hex } from "../../../platform/crypto.ts";
import { config } from "../../../platform/config.ts";
import type { Order } from "../../orders/orders.repo.ts";
import type { PaymentMethod } from "../methods.repo.ts";
import { endpointsFor } from "../methodSpecs.ts";
import { pktParts, postWithTimeout, safeJson, str, type Provider } from "./types.ts";

/**
 * PayFast (APPS, Pakistan) hosted checkout.
 * Trust model: PayFast signs its callbacks with
 *   validation_hash = sha256(basket_id|secured_key|merchant_id|err_code)
 * The secured key never leaves the server, so a valid hash proves the result.
 */
function amount(minor: number): string {
  return (minor / 100).toFixed(2);
}

async function requestToken(method: PaymentMethod, basketId: string, txnAmount: string, customerIp = "127.0.0.1") {
  const urls = endpointsFor("payfast", method.mode);
  const body = new URLSearchParams({
    MERCHANT_ID: method.config.merchantId ?? "",
    SECURED_KEY: method.config.securedKey ?? "",
    BASKET_ID: basketId,
    TXNAMT: txnAmount,
    CURRENCY_CODE: "PKR",
    // Lower-case duplicates kept from the previous integration that worked with UAT and live.
    merchant_id: method.config.merchantId ?? "",
    secured_key: method.config.securedKey ?? "",
    grant_type: "client_credentials",
    customer_ip: customerIp,
  });
  const response = await postWithTimeout(urls.token ?? "", {
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const json = safeJson(response.text);
  const token = str(json?.ACCESS_TOKEN) || str(json?.token);
  return { token, status: response.status, json, text: response.text };
}

export function payfastValidationHash(input: { basketId: string; securedKey: string; merchantId: string; errCode: string }): string {
  return sha256Hex(`${input.basketId}|${input.securedKey}|${input.merchantId}|${input.errCode}`);
}

export type PayfastCallback = { basketId: string; errCode: string; txnId: string; amountMinor: number | null; hash: string };

export function readPayfastCallback(params: Record<string, unknown>): PayfastCallback {
  const rawAmount = str(params.transaction_amount) || str(params.TXNAMT);
  const parsed = Number.parseFloat(rawAmount);
  return {
    basketId: str(params.basket_id) || str(params.BASKET_ID),
    errCode: str(params.err_code),
    txnId: str(params.transaction_id),
    amountMinor: rawAmount.length > 0 && Number.isFinite(parsed) ? Math.round(parsed * 100) : null,
    hash: str(params.validation_hash).toLowerCase(),
  };
}

export function verifyPayfastCallback(callback: PayfastCallback, method: PaymentMethod): boolean {
  if (callback.hash.length !== 64 || callback.basketId.length === 0) return false;
  const expected = payfastValidationHash({
    basketId: callback.basketId,
    securedKey: method.config.securedKey ?? "",
    merchantId: method.config.merchantId ?? "",
    errCode: callback.errCode,
  });
  return safeEqual(expected, callback.hash);
}

export const isPayfastSuccess = (errCode: string) => errCode === "000" || errCode === "00";

export const payfast: Provider = {
  async start(order: Order, method: PaymentMethod, reference: string) {
    const txnAmount = amount(order.totalMinor);
    const token = await requestToken(method, reference, txnAmount, order.clientIp || "127.0.0.1");
    if (token.token.length === 0) {
      throw new Error(`PayFast token request failed (HTTP ${token.status})`);
    }
    const now = pktParts(new Date());
    const urls = endpointsFor("payfast", method.mode);
    return {
      action: urls.checkout ?? "",
      method: "POST",
      fields: {
        MERCHANT_ID: method.config.merchantId ?? "",
        MERCHANT_NAME: method.config.merchantName ?? "",
        TOKEN: token.token,
        PROCCODE: "00",
        TXNAMT: txnAmount,
        CUSTOMER_MOBILE_NO: order.customerPhone,
        CUSTOMER_EMAIL_ADDRESS: order.customerEmail,
        SIGNATURE: randomToken(12),
        VERSION: "MERCHANT-CART-0.1",
        TXNDESC: `Embroidery designs ${order.number}`,
        SUCCESS_URL: `${config.SITE_URL}/hooks/payfast/return`,
        FAILURE_URL: `${config.SITE_URL}/hooks/payfast/return`,
        BASKET_ID: reference,
        ORDER_DATE: `${now.y}-${now.m}-${now.d} ${now.h}:${now.i}:${now.s}`,
        CHECKOUT_URL: `${config.SITE_URL}/hooks/payfast/ipn`,
        CURRENCY_CODE: "PKR",
        TRAN_TYPE: "ECOMM_PURCHASE",
      },
    };
  },

  async inquire() {
    return {
      status: "unknown",
      amountMinor: null,
      txnId: null,
      message: "PayFast confirms payments through its signed callback (IPN). Check the PayFast portal for this basket ID.",
      raw: null,
    };
  },

  async test(method: PaymentMethod) {
    try {
      const result = await requestToken(method, `TEST${Date.now()}`, "1.00");
      if (result.token.length > 0) return { ok: true, message: `PayFast accepted the credentials (${method.mode})` };
      if (result.json === null) {
        return { ok: false, message: `PayFast returned a non-JSON page (HTTP ${result.status}). Ask PayFast to whitelist this server's IP.` };
      }
      const reason = str(result.json.errorDescription) || str(result.json.message) || str(result.json.Message);
      return { ok: false, message: `PayFast rejected the credentials: ${reason || `HTTP ${result.status}`}` };
    } catch (error) {
      return { ok: false, message: `Could not reach PayFast: ${(error as Error).message}` };
    }
  },
};
