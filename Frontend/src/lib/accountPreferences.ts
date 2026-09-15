export type AccountPreferences = {
  firstName: string;
  lastName: string;
  displayName: string;
  country: string;
  preferredFormat: "PES" | "DST" | "JEF" | "all";
  rememberFormat: boolean;
  openDownloadInstructions: boolean;
};

export const accountPreferencesStorageKey = "embroidery-account-preferences";
export const accountPreferencesUpdatedEventName =
  "embroidery-account-preferences-updated";

export const defaultAccountPreferences: AccountPreferences = {
  firstName: "",
  lastName: "",
  displayName: "",
  country: "",
  preferredFormat: "all",
  rememberFormat: true,
  openDownloadInstructions: false,
};

export function notifyAccountPreferencesUpdated(): void {
  window.dispatchEvent(new Event(accountPreferencesUpdatedEventName));
}

export function parseAccountPreferences(raw: string): AccountPreferences {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) {
      return defaultAccountPreferences;
    }

    const value = parsed as Partial<AccountPreferences>;

    return {
      firstName: typeof value.firstName === "string" ? value.firstName : "",
      lastName: typeof value.lastName === "string" ? value.lastName : "",
      displayName: typeof value.displayName === "string" ? value.displayName : "",
      country: typeof value.country === "string" ? value.country : "",
      preferredFormat:
        value.preferredFormat === "PES" ||
        value.preferredFormat === "DST" ||
        value.preferredFormat === "JEF" ||
        value.preferredFormat === "all"
          ? value.preferredFormat
          : "all",
      rememberFormat:
        typeof value.rememberFormat === "boolean"
          ? value.rememberFormat
          : true,
      openDownloadInstructions:
        typeof value.openDownloadInstructions === "boolean"
          ? value.openDownloadInstructions
          : false,
    };
  } catch {
    return defaultAccountPreferences;
  }
}

export function readAccountPreferences(): AccountPreferences {
  try {
    return parseAccountPreferences(
      localStorage.getItem(accountPreferencesStorageKey) ?? "{}",
    );
  } catch {
    return defaultAccountPreferences;
  }
}

export function writeAccountPreferences(
  preferences: AccountPreferences,
): void {
  localStorage.setItem(
    accountPreferencesStorageKey,
    JSON.stringify(preferences),
  );
  notifyAccountPreferencesUpdated();
}

export function clearAccountPreferences(): void {
  localStorage.removeItem(accountPreferencesStorageKey);
  notifyAccountPreferencesUpdated();
}
