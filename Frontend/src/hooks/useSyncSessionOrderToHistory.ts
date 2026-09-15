"use client";

import { useEffect } from "react";

import { notifyOrderHistoryUpdated } from "@/hooks/useOrderHistory";
import {
  findOrderInHistory,
  readLocalOrder,
} from "@/lib/session/orderSession";

/** Moves the latest checkout session order into durable device history once. */
export function useSyncSessionOrderToHistory(): void {
  useEffect(() => {
    const current = readLocalOrder();

    if (current === null) {
      return;
    }

    if (findOrderInHistory(current.id) !== null) {
      return;
    }

    notifyOrderHistoryUpdated();
  }, []);
}
