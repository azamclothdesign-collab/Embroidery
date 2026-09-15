"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  type AccountPreferences,
  accountPreferencesStorageKey,
  accountPreferencesUpdatedEventName,
  defaultAccountPreferences,
  parseAccountPreferences,
} from "@/lib/accountPreferences";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(accountPreferencesUpdatedEventName, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(accountPreferencesUpdatedEventName, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): string {
  return localStorage.getItem(accountPreferencesStorageKey) ?? "{}";
}

function getServerSnapshot(): string {
  return "{}";
}

export function useAccountPreferences(): AccountPreferences {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => parseAccountPreferences(raw), [raw]);
}

export { defaultAccountPreferences };
