import type { Locale } from "../types";
import { en, type Dictionary } from "./en";
import { ur } from "./ur";

export const LOCALES = ["en", "ur"] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return locale === "ur" ? "rtl" : "ltr";
}

export function getDictionary(locale: Locale): Dictionary {
  return locale === "ur" ? ur : en;
}

/** Swap the locale segment of a pathname: /en/c/x → /ur/c/x */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/");
  if (parts[1] !== undefined && isLocale(parts[1])) parts[1] = target;
  else parts.splice(1, 0, target);
  return parts.join("/") || `/${target}`;
}

export type { Dictionary };
