import { config } from "../../platform/config.ts";
import { htmlEscape } from "../../platform/http.ts";
import { emailButton, emailLayout, sendMail } from "../../platform/mailer.ts";
import { getSetting } from "../../platform/settingsStore.ts";
import type { Order } from "./orders.repo.ts";

export function accessUrl(order: Pick<Order, "number" | "locale">, token: string): string {
  return `${config.SITE_URL}/${order.locale}/order/${order.number}/access?t=${encodeURIComponent(token)}`;
}

function rupees(minor: number): string {
  return `Rs ${(minor / 100).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const copy = {
  en: {
    receivedSubject: (n: string) => `Order ${n} received`,
    receivedIntro: "Thanks for your order. Keep this email: the button below opens your order page anytime.",
    paidSubject: (n: string) => `Your designs are ready — order ${n}`,
    paidIntro: "Payment confirmed. Your ZIP files are ready to download from your order page.",
    linkSubject: (n: string) => `Your link for order ${n}`,
    linkIntro: "Here is a fresh link to your order page.",
    button: "Open my order",
    total: "Total",
  },
  ur: {
    receivedSubject: (n: string) => `آرڈر ${n} موصول ہو گیا`,
    receivedIntro: "آرڈر کا شکریہ۔ یہ ای میل سنبھال کر رکھیں، نیچے والا بٹن کسی بھی وقت آپ کا آرڈر صفحہ کھولتا ہے۔",
    paidSubject: (n: string) => `آپ کے ڈیزائن تیار ہیں — آرڈر ${n}`,
    paidIntro: "ادائیگی کی تصدیق ہو گئی۔ آپ کی ZIP فائلیں آرڈر صفحے سے ڈاؤن لوڈ کے لیے تیار ہیں۔",
    linkSubject: (n: string) => `آرڈر ${n} کا لنک`,
    linkIntro: "یہ رہا آپ کے آرڈر صفحے کا نیا لنک۔",
    button: "میرا آرڈر کھولیں",
    total: "کل",
  },
} as const;

type Kind = "received" | "paid" | "link";

export async function sendOrderEmail(kind: Kind, order: Order, token: string): Promise<boolean> {
  const store = await getSetting("store");
  const t = copy[order.locale];
  const subject = kind === "received" ? t.receivedSubject(order.number) : kind === "paid" ? t.paidSubject(order.number) : t.linkSubject(order.number);
  const intro = kind === "received" ? t.receivedIntro : kind === "paid" ? t.paidIntro : t.linkIntro;
  const link = accessUrl(order, token);
  const items = order.lines
    .map((line) => `<li>${htmlEscape(order.locale === "ur" && line.name.ur ? line.name.ur : line.name.en)} — ${rupees(line.priceMinor)}</li>`)
    .join("");

  return sendMail({
    to: order.customerEmail,
    subject,
    text: `${intro}\n\n${order.number}\n${t.total}: ${rupees(order.totalMinor)}\n\n${link}`,
    html: emailLayout(
      htmlEscape(store.name[order.locale] || store.name.en),
      `<p>${htmlEscape(intro)}</p><p><strong>${order.number}</strong></p><ul>${items}</ul>
       <p><strong>${t.total}: ${rupees(order.totalMinor)}</strong></p>${emailButton(link, t.button)}`,
      order.locale === "ur" ? "rtl" : "ltr",
    ),
  });
}
