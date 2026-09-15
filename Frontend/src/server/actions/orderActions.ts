"use server";

import { ApiClientError } from "@/lib/api/apiClient";
import {
  createOrder,
  deleteOrder,
  fetchOrderById,
  fetchOrders,
} from "@/lib/api/ordersApi";
import { type CartLine } from "@/types/api/cart";
import { type OrderRecord } from "@/types/api/order";

export async function createOrderAction(input: {
  email: string;
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
