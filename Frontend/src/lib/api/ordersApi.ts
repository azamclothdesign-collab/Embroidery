import { apiRoutes } from "@/constants/apiRoutes";
import { maxPackageJsonBytes } from "@/constants/httpLimits";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import { type CartLine } from "@/types/api/cart";
import { type OrderRecord } from "@/types/api/order";

import "server-only";

type OrdersListResponse = {
  orders: OrderRecord[];
};

type OrderDetailsResponse = {
  order: OrderRecord;
};

type OrderCreateResponse = {
  order: OrderRecord;
};

type OrderPackageDownloadResponse = {
  file: {
    fileName: string;
    contentType: string;
    contentBase64: string;
    byteLength: number;
  };
};

export async function fetchOrders(): Promise<OrderRecord[]> {
  const data = await requestApiJsonWithContext<OrdersListResponse>({
    method: "GET",
    path: apiRoutes.orders.list,
    cacheStrategy: { cache: "no-store" },
  });

  return data.orders;
}

export async function fetchOrderById(orderId: string): Promise<OrderRecord> {
  const data = await requestApiJsonWithContext<OrderDetailsResponse>({
    method: "GET",
    path: apiRoutes.orders.details(orderId),
    cacheStrategy: { cache: "no-store" },
  });

  return data.order;
}

export async function createOrder(input: {
  email: string;
  totalCents: number;
  discountCents: number;
  lines: readonly CartLine[];
  idempotencyKey?: string | undefined;
}): Promise<OrderRecord> {
  const data = await requestApiJsonWithContext<OrderCreateResponse>({
    method: "POST",
    path: apiRoutes.orders.create,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });

  return data.order;
}

export async function downloadOrderPackage(input: {
  orderId: string;
  productSlug: string;
}): Promise<OrderPackageDownloadResponse["file"]> {
  const data = await requestApiJsonWithContext<OrderPackageDownloadResponse>({
    method: "POST",
    path: apiRoutes.orders.download,
    body: input,
    cacheStrategy: { cache: "no-store" },
    maxResponseBytes: maxPackageJsonBytes,
  });

  return data.file;
}

export async function deleteOrder(orderId: string): Promise<{ ok: true }> {
  return requestApiJsonWithContext<{ ok: true }>({
    method: "DELETE",
    path: apiRoutes.orders.delete(orderId),
    cacheStrategy: { cache: "no-store" },
  });
}
