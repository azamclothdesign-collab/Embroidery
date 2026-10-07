"use server";

import { ApiClientError } from "@/lib/api/apiClient";
import {
  createOrder,
  deleteOrder,
  fetchOrderById,
  fetchOrders,
} from "@/lib/api/ordersApi";
import {
  confirmPayFastPayment,
  fetchPaymentGatewayStatus,
  initPayFastPayment,
  type PayFastInitResult,
  type PaymentGatewayStatus,
} from "@/lib/api/paymentsApi";
import { type CartLine } from "@/types/api/cart";
import { type OrderRecord } from "@/types/api/order";

export async function createOrderAction(input: {
  email: string;
  contactName: string;
  phone: string;
  totalCents: number;
  discountCents: number;
  lines: readonly CartLine[];
  idempotencyKey?: string | undefined;
}): Promise<
  { ok: true; order: OrderRecord } | { ok: false; error: string }
> {
  try {
    const order = await createOrder(input);
    return { ok: true, order };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.code };
    }

    return { ok: false, error: "failed" };
  }
}

export async function getPaymentGatewayStatusAction(): Promise<PaymentGatewayStatus> {
  try {
    return await fetchPaymentGatewayStatus();
  } catch {
    return {
      enabled: false,
      provider: "payfast",
      mode: "sandbox",
      configured: false,
    };
  }
}

export async function initPayFastPaymentAction(input: {
  orderId: string;
  locale: string;
}): Promise<
  { ok: true; checkout: PayFastInitResult } | { ok: false; error: string }
> {
  try {
    const checkout = await initPayFastPayment(input);
    return { ok: true, checkout };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.code };
    }

    return { ok: false, error: "failed" };
  }
}

export async function confirmPayFastPaymentAction(input: {
  orderId: string;
  signature?: string;
  paymentReference?: string;
  markFailed?: boolean;
}): Promise<
  { ok: true; order: OrderRecord } | { ok: false; error: string }
> {
  try {
    const order = await confirmPayFastPayment(input);
    return { ok: true, order };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.code };
    }

    return { ok: false, error: "failed" };
  }
}

export async function getOrdersAction(): Promise<OrderRecord[]> {
  try {
    return await fetchOrders();
  } catch {
    return [];
  }
}

export async function getOrderAction(
  orderId: string,
): Promise<OrderRecord | null> {
  try {
    return await fetchOrderById(orderId);
  } catch {
    return null;
  }
}

export async function deleteOrderAction(
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await deleteOrder(orderId);
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.message || error.code };
    }

    return { ok: false, error: "failed" };
  }
}
