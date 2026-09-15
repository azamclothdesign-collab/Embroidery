"use client";

import { useSyncExternalStore } from "react";

import {
  customerAuthUpdatedEventName,
  type CustomerSession,
} from "@/lib/session/customerAuth";
import { getCustomerSessionAction } from "@/server/actions/customerAuthActions";

type CustomerSessionSnapshot = {
  session: CustomerSession | null;
  isReady: boolean;
  version: number;
};

const emptySnapshot: CustomerSessionSnapshot = {
  session: null,
  isReady: false,
  version: 0,
};

let snapshot: CustomerSessionSnapshot = emptySnapshot;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

async function refreshCustomerSession(): Promise<void> {
  try {
    const session = await getCustomerSessionAction();
    snapshot = {
      session,
      isReady: true,
      version: snapshot.version + 1,
    };
    emit();
  } catch {
    snapshot = {
      session: null,
      isReady: true,
      version: snapshot.version + 1,
    };
    emit();
  }
}

function ensureRefresh(): void {
  if (fetchPromise !== null) {
    return;
  }

  if (snapshot.isReady && snapshot.session === null) {
    snapshot = {
      session: null,
      isReady: false,
      version: snapshot.version + 1,
    };
    emit();
  }

  fetchPromise = refreshCustomerSession().finally(() => {
    fetchPromise = null;
  });
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  ensureRefresh();

  const onAuthUpdate = () => {
    snapshot = {
      session: snapshot.session,
      isReady: false,
      version: snapshot.version + 1,
    };
    emit();
    void refreshCustomerSession();
  };

  window.addEventListener(customerAuthUpdatedEventName, onAuthUpdate);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener(customerAuthUpdatedEventName, onAuthUpdate);
  };
}

function getSnapshot(): CustomerSessionSnapshot {
  return snapshot;
}

function getServerSnapshot(): CustomerSessionSnapshot {
  return emptySnapshot;
}

export function useCustomerSession(): CustomerSession | null {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return current.session;
}

export function useCustomerSessionReady(): boolean {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return current.isReady;
}
