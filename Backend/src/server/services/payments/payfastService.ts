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

async function fetchAccessToken(
  settings: SitePaymentsSettings,
  customerIp: string,
): Promise<string> {
  const body = new URLSearchParams({
    merchant_id: settings.merchantId,
    secured_key: settings.securedKey,
    grant_type: "client_credentials",
    customer_ip: customerIp,
  });

  const response = await fetch(settings.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const raw = (await response.json()) as Record<string, unknown>;
  const token =
    (typeof raw.token === "string" && raw.token) ||
    (typeof raw.ACCESS_TOKEN === "string" && raw.ACCESS_TOKEN) ||
    (typeof asRecord(raw.data).token === "string" &&
      String(asRecord(raw.data).token)) ||
    "";

  if (!response.ok || token.length === 0) {
    console.error("[payfast] token error", raw);
    throw new ServiceError(
      502,
      "payfast_token_failed",
      "Unable to start PayFast payment",
    );
  }

  return token;
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

  const token = await fetchAccessToken(settings, input.customerIp);
  const amount = amountFromCents(order.totalCents);
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
