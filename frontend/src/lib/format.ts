import type { Locale } from "./types";

/** Prices are integer paisa. Shown as "Rs 2,999" (no decimals when whole). */
export function formatPrice(minor: number, locale: Locale = "en"): string {
  const rupees = minor / 100;
  const number = new Intl.NumberFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
    numberingSystem: "latn",
  }).format(rupees);
  return locale === "ur" ? `${number} روپے` : `Rs ${number}`;
}

export function formatDate(iso: string, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
    numberingSystem: "latn",
  }).format(new Date(iso));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export function percentOff(price: number, sale: number): number {
  return Math.round(((price - sale) / price) * 100);
}
