import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function cartLabels(locale: Locale) {
  const t = getDictionary(locale);
  return {
    title: t.cart.title,
    empty: t.cart.empty,
    emptyCta: t.cart.emptyCta,
    remove: t.cart.remove,
    subtotal: t.cart.subtotal,
    discount: t.cart.discount,
    total: t.cart.total,
    coupon: t.cart.coupon,
    apply: t.cart.apply,
    checkout: t.cart.checkout,
    continue: t.cart.continue,
    unavailable: t.cart.unavailable,
    couponErrors: t.cart.couponErrors,
  };
}
