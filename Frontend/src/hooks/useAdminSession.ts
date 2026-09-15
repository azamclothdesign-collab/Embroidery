"use client";

import { useSyncExternalStore } from "react";

import {
  adminAuthUpdatedEventName,
  type AdminSession,
  notifyAdminAuthUpdated,
} from "@/lib/session/adminAuth";
import { getAdminSessionAction } from "@/server/actions/adminAuthActions";

type AdminSessionSnapshot = {
  session: AdminSession | null;
  isReady: boolean;
  version: number;
};

const emptySnapshot: AdminSessionSnapshot = {
  session: null,
  isReady: false,
  version: 0,
};

let snapshot: AdminSessionSnapshot = emptySnapshot;
let fetchPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

async function refreshAdminSession(): Promise<void> {
  try {
    const session = await getAdminSessionAction();
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

  fetchPromise = refreshAdminSession().finally(() => {
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
    void refreshAdminSession();
  };

  window.addEventListener(adminAuthUpdatedEventName, onAuthUpdate);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener(adminAuthUpdatedEventName, onAuthUpdate);
  };
}

function getSnapshot(): AdminSessionSnapshot {
  return snapshot;
}

function getServerSnapshot(): AdminSessionSnapshot {
  return emptySnapshot;
}

export function useAdminSession(): AdminSession | null {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return current.session;
}

export function useAdminSessionReady(): boolean {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return current.isReady;
}

export function triggerAdminAuthUpdated(): void {
  notifyAdminAuthUpdated();
}
