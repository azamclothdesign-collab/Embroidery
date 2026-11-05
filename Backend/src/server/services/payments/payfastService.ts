import { createHash } from "node:crypto";

import { env } from "../../../schemas/envSchema.js";
import { type OrderRecord } from "../../../types/order.js";
import { type SitePaymentsSettings } from "../../../types/siteSettings.js";
import { ServiceError } from "../../../utils/serviceError.js";
import {
  getSiteSettings,
  paymentsConfigured,
} from "../site/siteSettingsService.js";
import {
  findOrderById,
  updateOrderPayment,
} from "../../database/repositories/orders/orderRepository.js";

export type PayFastCheckoutFields = Record<string, string>;

type PayFastTokenFailureReason =
  | "invalid_credentials"
  | "rejected"
  | "unexpected_response"
  | "unreachable";

type PayFastTokenResult =
  | { ok: true; token: string }
  | {
      ok: false;
      reason: PayFastTokenFailureReason;
      status: number | null;
      detail: string;
    };

export type PayFastVerifyResult = {
  ok: boolean;
  mode: SitePaymentsSettings["mode"];
  merchantId: string;
  tokenUrl: string;
  reason?: PayFastTokenFailureReason;
  status?: number | null;
  detail?: string;
};

const tokenRequestTimeoutMs = 20_000;

const tokenFailureCodes: Record<PayFastTokenFailureReason, string> = {
  invalid_credentials: "payfast_invalid_credentials",
  rejected: "payfast_rejected",
  unexpected_response: "payfast_unexpected_response",
  unreachable: "payfast_unreachable",
};

function publicOrigin(): string {
  if (env.APP_PUBLIC_ORIGIN !== undefined) {
    return env.APP_PUBLIC_ORIGIN.replace(/\/$/, "");
  }

  const origins = env.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins[0]?.replace(/\/$/, "") ?? "http://localhost:3000";
}

function absoluteCallbackUrl(path: string, locale = "en"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (normalized.startsWith("/en/") || normalized.startsWith(`/${locale}/`)) {
    return `${publicOrigin()}${normalized}`;
  }

  return `${publicOrigin()}/${locale}${normalized}`;
}

function amountFromCents(totalCents: number): string {
  return (totalCents / 100).toFixed(2);
}

export function buildPayFastSignature(input: {
  merchantId: string;
  merchantName: string;
  amount: string;
  basketId: string;
}): string {
  return createHash("md5")
    .update(
      `${input.merchantId}:${input.merchantName}:${input.amount}:${input.basketId}`,
    )
    .digest("hex");
}

export async function getPaymentsSettings(): Promise<SitePaymentsSettings> {
  return getSiteSettings<SitePaymentsSettings>("payments");
}

export async function requireEnabledPayments(): Promise<SitePaymentsSettings> {
  const settings = await getPaymentsSettings();

  if (!settings.gatewayEnabled) {
    throw new ServiceError(
      503,
      "gateway_disabled",
      "Payment gateway is currently turned off",
    );
  }

  if (!paymentsConfigured(settings)) {
    throw new ServiceError(
      503,
      "gateway_not_configured",
      "Payment gateway is not configured",
    );
  }

  return settings;
}

async function requestAccessToken(
  settings: SitePaymentsSettings,
  input: {
    customerIp: string;
    basketId: string;
    amount: string;
  },
): Promise<PayFastTokenResult> {
  const customerIp =
    input.customerIp.trim().length > 0 ? input.customerIp.trim() : "127.0.0.1";

  // Live PayFast expects basket/amount (+ currency). Keep grant_type fields for
  // sandbox-compatible endpoints. Empty User-Agent is rejected by PayFast.
  const body = new URLSearchParams({
    MERCHANT_ID: settings.merchantId,
    SECURED_KEY: settings.securedKey,
    BASKET_ID: input.basketId,
    TXNAMT: input.amount,
    CURRENCY_CODE: "PKR",
    merchant_id: settings.merchantId,
    secured_key: settings.securedKey,
    grant_type: "client_credentials",
    customer_ip: customerIp,
  });

  let status: number;
  let text: string;

  try {
    const response = await fetch(settings.tokenUrl, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "EmbroideryStore/1.0 (PayFast Checkout)",
      },
      body,
      signal: AbortSignal.timeout(tokenRequestTimeoutMs),
    });
    status = response.status;
    text = await response.text();
  } catch (error) {
    return {
      ok: false,
      reason: "unreachable",
      status: null,
      detail: describeFetchError(error),
    };
  }

  let raw: Record<string, unknown>;

  try {
    raw = asRecord(JSON.parse(text));
  } catch {
    return {
      ok: false,
      reason: "unexpected_response",
      status,
      detail: describeNonJsonBody(text),
    };
  }

  const data = asRecord(raw.data);
  const token =
    readText(raw.token) ||
    readText(raw.ACCESS_TOKEN) ||
    readText(data.token) ||
    readText(data.ACCESS_TOKEN);
  const errorCode = readText(raw.errorCode) || readText(raw.error_code);
  const errorDescription =
    readText(raw.errorDescription) ||
    readText(raw.error_description) ||
    readText(raw.Message) ||
    readText(raw.message);
  const succeeded =
    status >= 200 &&
    status < 300 &&
    token.length > 0 &&
    /^0*$/.test(errorCode);

  if (succeeded) {
    return { ok: true, token };
  }

  return {
    ok: false,
    reason: /secret key|secured key|not matched/i.test(errorDescription)
      ? "invalid_credentials"
      : "rejected",
    status,
    detail:
      [errorCode, errorDescription]
        .filter((part) => part.length > 0)
        .join(": ") || `HTTP ${status}`,
  };
}

async function fetchAccessToken(
  settings: SitePaymentsSettings,
  input: {
    customerIp: string;
    basketId: string;
    amount: string;
  },
): Promise<string> {
  const result = await requestAccessToken(settings, input);

  if (result.ok) {
    return result.token;
  }

  console.error("[payfast] token failed", {
    mode: settings.mode,
    merchantId: settings.merchantId,
    tokenUrl: settings.tokenUrl,
    reason: result.reason,
    status: result.status,
    detail: result.detail,
  });

  throw new ServiceError(
    502,
    tokenFailureCodes[result.reason],
    "Unable to start PayFast payment",
  );
}

export async function verifyPayFastCredentials(): Promise<PayFastVerifyResult> {
  const settings = await getPaymentsSettings();

  if (!paymentsConfigured(settings)) {
    throw new ServiceError(
      400,
      "gateway_not_configured",
      "Payment gateway is not configured",
    );
  }

  const summary = {
    mode: settings.mode,
    merchantId: settings.merchantId,
    tokenUrl: settings.tokenUrl,
  };
  const result = await requestAccessToken(settings, {
    customerIp: "127.0.0.1",
    basketId: `VERIFY-${Date.now()}`,
    amount: "1.00",
  });

  if (result.ok) {
    return { ok: true, ...summary };
  }

  console.error("[payfast] verify failed", {
    ...summary,
    reason: result.reason,
    status: result.status,
    detail: result.detail,
  });

  return {
    ok: false,
    ...summary,
    reason: result.reason,
    status: result.status,
    detail: result.detail,
  };
}

function describeFetchError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Network error";
  }

  if (error.name === "TimeoutError") {
    return `No response within ${tokenRequestTimeoutMs / 1000}s`;
  }

  const causeCode = readText(asRecord(error.cause).code);
  return causeCode.length > 0 ? `${error.message} (${causeCode})` : error.message;
}

function describeNonJsonBody(text: string): string {
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(text)?.[1]?.trim() ?? "";

  if (title.length > 0) {
    return title;
  }

  const snippet = text.replace(/\s+/g, " ").trim().slice(0, 160);
  return snippet.length > 0 ? snippet : "Empty response";
}

function readText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export async function initPayFastCheckout(input: {
  orderId: string;
  customerIp: string;
  locale?: string;
}): Promise<{ checkoutUrl: string; fields: PayFastCheckoutFields }> {
  const settings = await requireEnabledPayments();
  const order = await findOrderById(input.orderId);

  if (order === null) {
    throw new ServiceError(404, "not_found", "Order not found");
  }

  if (order.paymentStatus === "paid") {
    throw new ServiceError(409, "already_paid", "Order is already paid");
  }

  const amount = amountFromCents(order.totalCents);
  const token = await fetchAccessToken(settings, {
    customerIp: input.customerIp,
    basketId: order.id,
    amount,
  });
  const signature = buildPayFastSignature({
    merchantId: settings.merchantId,
    merchantName: settings.merchantName,
    amount,
    basketId: order.id,
  });
  const locale = input.locale ?? "en";
  const successUrl = absoluteCallbackUrl(settings.successPath, locale);
  const failureUrl = absoluteCallbackUrl(settings.failurePath, locale);
  const mobile = (order.phone ?? "").replace(/\D/g, "") || "03000000000";

  const fields: PayFastCheckoutFields = {
    MERCHANT_ID: settings.merchantId,
    MERCHANT_NAME: settings.merchantName,
    TOKEN: token,
    PROCCODE: "00",
    TXNAMT: amount,
    CURRENCY_CODE: "PKR",
    CUSTOMER_MOBILE_NO: mobile,
    CUSTOMER_EMAIL_ADDRESS: order.email,
    SIGNATURE: signature,
    VERSION: "EMBROIDERY-STORE-1.0",
    TXNDESC: `Embroidery order ${order.id}`,
    SUCCESS_URL: successUrl,
    FAILURE_URL: failureUrl,
    BASKET_ID: order.id,
    ORDER_DATE: new Date().toISOString().slice(0, 19).replace("T", " "),
    CHECKOUT_URL: `signature=${signature}&order_id=${encodeURIComponent(order.id)}`,
  };

  await updateOrderPayment({
    orderId: order.id,
    paymentStatus: "pending",
    paymentProvider: "payfast",
  });

  return {
    checkoutUrl: settings.checkoutUrl,
    fields,
  };
}

export async function confirmPayFastPayment(input: {
  orderId: string;
  signature?: string | undefined;
  paymentReference?: string | undefined;
  markFailed?: boolean;
}): Promise<OrderRecord> {
  const settings = await getPaymentsSettings();
  const order = await findOrderById(input.orderId);

  if (order === null) {
    throw new ServiceError(404, "not_found", "Order not found");
  }

  if (order.paymentStatus === "paid") {
    return order;
  }

  if (input.markFailed === true) {
    const failed = await updateOrderPayment({
      orderId: order.id,
      paymentStatus: "failed",
      paymentProvider: "payfast",
      ...(input.paymentReference !== undefined
        ? { paymentReference: input.paymentReference }
        : {}),
    });

    if (failed === null) {
      throw new ServiceError(404, "not_found", "Order not found");
    }

    return failed;
  }

  const amount = amountFromCents(order.totalCents);
  const expected = buildPayFastSignature({
    merchantId: settings.merchantId,
    merchantName: settings.merchantName,
    amount,
    basketId: order.id,
  });

  if (
    input.signature !== undefined &&
    input.signature.length > 0 &&
    input.signature !== expected
  ) {
    throw new ServiceError(400, "invalid_signature", "Invalid payment signature");
  }

  const paid = await updateOrderPayment({
    orderId: order.id,
    paymentStatus: "paid",
    paymentProvider: "payfast",
    ...(input.paymentReference !== undefined
      ? { paymentReference: input.paymentReference }
      : {}),
  });

  if (paid === null) {
    throw new ServiceError(404, "not_found", "Order not found");
  }

  return paid;
}
