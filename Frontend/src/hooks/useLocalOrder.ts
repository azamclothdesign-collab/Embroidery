"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import {
  type LocalOrder,
  localOrderStorageKey,
  readLocalOrder,
} from "@/lib/session/orderSession";
import { getOrderAction } from "@/server/actions/orderActions";
import { type OrderRecord } from "@/types/api/order";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): string {
  return sessionStorage.getItem(localOrderStorageKey) ?? "";
}

function getServerSnapshot(): string {
  return "";
}

function orderRecordToLocalOrder(order: OrderRecord): LocalOrder {
  return {
    id: order.id,
    email: order.email,
    createdAt: order.createdAt,
    totalCents: order.totalCents,
    discountCents: order.discountCents,
    lines: order.lines,
  };
}

export function useLocalOrder(): LocalOrder | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (raw.length === 0) {
    return null;
  }

  return readLocalOrder();
}

export function useAuthorizedLocalOrder(orderId: string): LocalOrder | null {
  const sessionOrder = useLocalOrder();
  const [apiOrder, setApiOrder] = useState<LocalOrder | null>(null);

  useEffect(() => {
    if (sessionOrder !== null && sessionOrder.id === orderId) {
      return;
    }

    void getOrderAction(orderId).then((order) => {
      if (order === null) {
        setApiOrder(null);
        return;
      }

      setApiOrder(orderRecordToLocalOrder(order));
    });
  }, [orderId, sessionOrder]);

  if (sessionOrder !== null && sessionOrder.id === orderId) {
    return sessionOrder;
  }

  return apiOrder;
}
