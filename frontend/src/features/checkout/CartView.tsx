"use client";

import { ShoppingBag, Tag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/features/cart/CartProvider";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/types";
import { useQuote } from "./useQuote";

export type CartLabels = {
  title: string;
  empty: string;
  emptyCta: string;
  remove: string;
  subtotal: string;
  discount: string;
  total: string;
  coupon: string;
  apply: string;
  checkout: string;
  continue: string;
  unavailable: string;
  couponErrors: Record<string, string>;
};

export const COUPON_STORAGE_KEY = "emb_coupon";

export function CartView({ locale, labels }: { locale: Locale; labels: CartLabels }) {
  const cart = useCart();
  const [draft, setDraft] = useState("");
  const [coupon, setCoupon] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(COUPON_STORAGE_KEY);
  });
  const { quote, error, removed, pending } = useQuote(coupon);

  if (!cart.ready) return <div className="card h-64 animate-pulse" aria-busy="true" />;

  if (cart.items.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-20 text-center">
        <ShoppingBag className="size-10 text-muted" aria-hidden />
        <p className="text-lg text-ink-soft">{labels.empty}</p>
        <Link href={`/${locale}/categories`} className="btn btn-primary">
          {labels.emptyCta}
        </Link>
      </div>
    );
  }

  const applyCoupon = (value: string | null) => {
    setCoupon(value);
    if (value === null) window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
    else window.sessionStorage.setItem(COUPON_STORAGE_KEY, value);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div>
        {removed && <p className="mb-4 rounded-xl bg-gold-soft px-4 py-3 text-sm font-semibold">{labels.unavailable}</p>}
        <ul className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-paper">
          {cart.items.map((item) => (
            <li key={item.slug} className="flex items-center gap-4 p-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand">
                {item.image !== null && <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/${locale}/d/${item.slug}`} className="block truncate font-semibold hover:text-saffron-strong">
                  {item.name}
                </Link>
                <p className="text-ink-soft">{formatPrice(item.salePriceMinor ?? item.priceMinor, locale)}</p>
              </div>
              <button type="button" className="icon-btn text-muted hover:text-danger" onClick={() => cart.remove(item.slug)} aria-label={`${labels.remove}: ${item.name}`}>
                <Trash2 className="size-5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <Link href={`/${locale}/designs`} className="btn btn-ghost mt-4">
          {labels.continue}
        </Link>
      </div>

      <aside className="card h-fit space-y-5 p-6" aria-busy={pending}>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const code = draft.trim().toUpperCase();
            applyCoupon(code.length > 0 ? code : null);
          }}
        >
          <label htmlFor="coupon" className="sr-only">
            {labels.coupon}
          </label>
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input id="coupon" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={labels.coupon} className="field ps-10 uppercase" maxLength={32} />
          </div>
          <button type="submit" className="btn btn-outline">
            {labels.apply}
          </button>
        </form>
        {quote?.couponError != null && <p className="field-error">{labels.couponErrors[quote.couponError] ?? quote.couponError}</p>}
        {quote?.couponCode != null && (
          <p className="flex items-center justify-between text-sm font-semibold text-success">
            {quote.couponCode}
            <button type="button" className="link text-xs" onClick={() => applyCoupon(null)}>
              {labels.remove}
            </button>
          </p>
        )}
        <Totals quote={quote} locale={locale} labels={labels} />
        {error !== null && <p className="field-error">{error}</p>}
        <Link href={`/${locale}/checkout`} className="btn btn-primary w-full">
          {labels.checkout}
        </Link>
      </aside>
    </div>
  );
}

export function Totals({
  quote,
  locale,
  labels,
}: {
  quote: { subtotalMinor: number; discountMinor: number; totalMinor: number } | null;
  locale: Locale;
  labels: Pick<CartLabels, "subtotal" | "discount" | "total">;
}) {
  const value = (minor: number | undefined) => (minor === undefined ? "—" : formatPrice(minor, locale));
  return (
    <dl className="space-y-2 border-t border-line pt-4">
      <div className="flex justify-between text-ink-soft">
        <dt>{labels.subtotal}</dt>
        <dd>{value(quote?.subtotalMinor)}</dd>
      </div>
      {quote !== null && quote.discountMinor > 0 && (
        <div className="flex justify-between text-success">
          <dt>{labels.discount}</dt>
          <dd>−{formatPrice(quote.discountMinor, locale)}</dd>
        </div>
      )}
      <div className="flex justify-between text-xl font-semibold">
        <dt>{labels.total}</dt>
        <dd>{value(quote?.totalMinor)}</dd>
      </div>
    </dl>
  );
}
