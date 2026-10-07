import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import { type OrderRecord } from "@/types/api/order";

import "server-only";

export type PaymentGatewayStatus = {
  enabled: boolean;
  provider: "payfast";
  mode: "sandbox" | "live";
  configured: boolean;
};

export type PayFastInitResult = {
  checkoutUrl: string;
  fields: Record<string, string>;
};

export async function fetchPaymentGatewayStatus(): Promise<PaymentGatewayStatus> {
  return requestApiJsonWithContext<PaymentGatewayStatus>({
    method: "GET",
    path: apiRoutes.payments.status,
    cacheStrategy: { cache: "no-store" },
  });
}

export async function initPayFastPayment(input: {
  orderId: string;
  locale?: string;
}): Promise<PayFastInitResult> {
  return requestApiJsonWithContext<PayFastInitResult>({
    method: "POST",
    path: apiRoutes.payments.payfastInit,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });
}

export async function confirmPayFastPayment(input: {
  orderId: string;
  signature?: string;
  paymentReference?: string;
  markFailed?: boolean;
}): Promise<OrderRecord> {
  const data = await requestApiJsonWithContext<{ order: OrderRecord }>({
    method: "POST",
    path: apiRoutes.payments.payfastConfirm,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });

  return data.order;
}
