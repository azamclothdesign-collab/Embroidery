"use client";

import { Building2, CreditCard, HandCoins, Loader2, Lock, Smartphone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { placeOrderAction } from "@/actions/store";
import { useCart } from "@/features/cart/CartProvider";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { pick, type Locale, type RedirectForm } from "@/lib/types";
import { COUPON_STORAGE_KEY, Totals, type CartLabels } from "./CartView";
import { PaymentRedirect } from "./PaymentRedirect";
import { useQuote } from "./useQuote";

export type CheckoutLabels = {
  contact: string;
  name: string;
  email: string;
  emailHelp: string;
  phone: string;
  phoneHelp: string;
  payment: string;
  noMethods: string;
  summary: string;
  agree: string;
  place: string;
  placing: string;
  redirecting: string;
  secure: string;
  required: string;
  termsHref: string;
};

const METHOD_ICONS = { payfast: CreditCard, jazzcash: Smartphone, easypaisa: Smartphone, bank: Building2, cod: HandCoins } as const;

export function CheckoutForm({ locale, labels, cartLabels }: { locale: Locale; labels: CheckoutLabels; cartLabels: CartLabels }) {
  const cart = useCart();
  const router = useRouter();
  const [coupon] = useState<string | null>(() => (typeof window === "undefined" ? null : window.sessionStorage.getItem(COUPON_STORAGE_KEY)));
  const { quote, error: quoteError } = useQuote(coupon);
  const [method, setMethod] = useState<string>("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [redirect, setRedirect] = useState<RedirectForm | null>(null);
  const [pending, startTransition] = useTransition();
  // One key per checkout attempt: double clicks and retries can never create two orders.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const methods = quote?.methods ?? [];
  const selected = method || methods[0]?.code || "";

  if (redirect !== null) return <PaymentRedirect form={redirect} label={labels.redirecting} buttonLabel={labels.place} />;
  if (cart.ready && cart.items.length === 0) {
    return (
      <div className="card px-6 py-16 text-center">
        <p className="text-ink-soft">{cartLabels.empty}</p>
        <Link href={`/${locale}/categories`} className="btn btn-primary mt-4">
          {cartLabels.emptyCta}
        </Link>
      </div>
    );
  }

  const submit = (form: FormData) => {
    setMessage(null);
    const next: Record<string, string> = {};
    for (const key of ["name", "email", "phone"]) if (String(form.get(key) ?? "").trim().length === 0) next[key] = labels.required;
    if (form.get("agree") !== "on") next.agree = labels.required;
    setFields(next);
    if (Object.keys(next).length > 0) {
      document.getElementById(`checkout-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    startTransition(async () => {
      const result = await placeOrderAction({
        items: cart.items.map((item) => item.slug),
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
        method: selected,
        couponCode: coupon,
        locale,
        idempotencyKey,
      });
      if (!result.ok) {
        setFields(result.fields ?? {});
        setMessage(result.message);
        const first = Object.keys(result.fields ?? {})[0];
        if (first !== undefined) document.getElementById(`checkout-${first}`)?.focus();
        return;
      }
      cart.clear();
      window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
      if (result.payment !== null) setRedirect(result.payment);
      else router.push(`/${locale}/order/${result.number}${result.paymentError ? "?payment=start_failed" : ""}`);
    });
  };

  const input = (name: "name" | "email" | "phone", type: string, autoComplete: string, label: string, help?: string) => (
    <div>
      <label htmlFor={`checkout-${name}`} className="field-label">
        {label}
      </label>
      <input
        id={`checkout-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="field"
        dir={name === "name" ? "auto" : "ltr"}
        aria-invalid={fields[name] !== undefined}
        aria-describedby={`checkout-${name}-hint`}
        {...(name === "phone" ? { inputMode: "tel" as const } : {})}
      />
      <p id={`checkout-${name}-hint`} className={fields[name] !== undefined ? "field-error" : "field-help"}>
        {fields[name] ?? help ?? ""}
      </p>
    </div>
  );

  return (
    <form action={submit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]" noValidate>
      <div className="space-y-8">
        <fieldset className="card space-y-4 p-6">
          <legend className="float-start mb-2 w-full text-xl font-semibold">{labels.contact}</legend>
          {input("name", "text", "name", labels.name)}
          {input("email", "email", "email", labels.email, labels.emailHelp)}
          {input("phone", "tel", "tel", labels.phone, labels.phoneHelp)}
        </fieldset>

        <fieldset className="card p-6">
          <legend className="float-start mb-4 w-full text-xl font-semibold">{labels.payment}</legend>
          {quote === null ? (
            <div className="h-24 animate-pulse rounded-xl bg-sand" />
          ) : methods.length === 0 ? (
            <p className="text-ink-soft">{labels.noMethods}</p>
          ) : (
            <div className="space-y-3" role="radiogroup">
              {methods.map((option) => {
                const Icon = METHOD_ICONS[option.code];
                const active = selected === option.code;
                return (
                  <label
                    key={option.code}
                    className={cn(
                      "flex cursor-pointer gap-4 rounded-2xl border p-4 transition",
                      active ? "border-ink bg-sand/60 ring-1 ring-ink" : "border-line hover:border-ink/40",
                    )}
                  >
                    <input type="radio" name="method" value={option.code} checked={active} onChange={() => setMethod(option.code)} className="mt-1 size-4 accent-ink" />
                    <Icon className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
                    <span>
                      <span className="block font-semibold">{pick(option.label, locale)}</span>
                      {active && <span className="mt-1 block text-sm text-ink-soft">{pick(option.instructions, locale)}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>
      </div>

      <aside className="card h-fit space-y-5 p-6 lg:sticky lg:top-28">
        <h2 className="text-xl">{labels.summary}</h2>
        <ul className="space-y-3">
          {cart.items.map((item) => (
            <li key={item.slug} className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                {item.image !== null && <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.name}</span>
              <span className="text-sm">{formatPrice(item.salePriceMinor ?? item.priceMinor, locale)}</span>
            </li>
          ))}
        </ul>
        <Totals quote={quote} locale={locale} labels={cartLabels} />
        <label className="flex items-start gap-3 text-sm">
          <input id="checkout-agree" type="checkbox" name="agree" className="mt-1 size-4 accent-ink" aria-invalid={fields.agree !== undefined} />
          <span>
            <Link href={labels.termsHref} className="link" target="_blank">
              {labels.agree}
            </Link>
          </span>
        </label>
        {(message ?? quoteError) !== null && (
          <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
            {message ?? quoteError}
          </p>
        )}
        <button type="submit" className="btn btn-primary w-full" disabled={pending || methods.length === 0 || quote === null}>
          {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
          {pending ? labels.placing : `${labels.place} · ${quote === null ? "" : formatPrice(quote.totalMinor, locale)}`}
        </button>
        <p className="text-center text-xs text-muted">{labels.secure}</p>
      </aside>
    </form>
  );
}
