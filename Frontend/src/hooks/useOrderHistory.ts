"use client";

import { useSyncExternalStore } from "react";

import { getOrdersAction } from "@/server/actions/orderActions";
import { type OrderRecord } from "@/types/api/order";

export const orderHistoryUpdatedEventName = "embroidery-order-history-updated";

let cachedOrders: OrderRecord[] = [];
let snapshotVersion = 0;
let fetchPromise: Promise<void> | null = null;

function getSnapshotVersion(): number {
  return snapshotVersion;
}

async function refreshOrderHistory(): Promise<void> {
  cachedOrders = await getOrdersAction();
  snapshotVersion += 1;
}

function ensureRefresh(): void {
  if (fetchPromise === null) {
    fetchPromise = refreshOrderHistory().finally(() => {
      fetchPromise = null;
    });
  }
}

function subscribe(onStoreChange: () => void): () => void {
  ensureRefresh();

  const onHistoryUpdate = () => {
    void refreshOrderHistory().then(onStoreChange);
  };

  window.addEventListener(orderHistoryUpdatedEventName, onHistoryUpdate);

  void refreshOrderHistory().then(onStoreChange);

  return () => {
    window.removeEventListener(orderHistoryUpdatedEventName, onHistoryUpdate);
  };
}

function getServerSnapshot(): number {
  return 0;
}

export function useOrderHistory(): OrderRecord[] {
  useSyncExternalStore(subscribe, getSnapshotVersion, getServerSnapshot);

  return cachedOrders;
}

export function useOrderById(orderId: string): OrderRecord | null {
  const history = useOrderHistory();

  return history.find((order) => order.id === orderId) ?? null;
}

export function notifyOrderHistoryUpdated(): void {
  window.dispatchEvent(new Event(orderHistoryUpdatedEventName));
}
