/** Public origin, safe on server and client (no secrets). */
export const SITE_URL = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Hosts the browser may POST to when leaving for a payment page (mirrors backend allow-list). */
export const PAYMENT_FORM_HOSTS = [
  "https://ipg1.apps.net.pk",
  "https://ipguat.apps.net.pk",
  "https://payments.jazzcash.com.pk",
  "https://sandbox.jazzcash.com.pk",
  "https://easypay.easypaisa.com.pk",
  "https://easypaystg.easypaisa.com.pk",
] as const;
