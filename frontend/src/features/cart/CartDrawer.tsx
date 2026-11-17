"use client";

import { ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/types";
import { lockScroll } from "@/features/motion/MotionLayer";
import { cartSubtotal, useCart } from "./CartProvider";

export type CartDrawerLabels = {
  title: string;
  empty: string;
  emptyCta: string;
  remove: string;
  subtotal: string;
  checkout: string;
  viewCart: string;
  close: string;
};

export function CartDrawer({ locale, labels }: { locale: Locale; labels: CartDrawerLabels }) {
  const cart = useCart();
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const rtl = locale === "ur";

  useEffect(() => {
    if (!cart.open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") cart.setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    lockScroll(true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lockScroll(false);
      previous?.focus();
    };
  }, [cart.open, cart]);

  return (
    <AnimatePresence>
      {cart.open && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label={labels.close}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => cart.setOpen(false)}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={labels.title}
            tabIndex={-1}
            data-lenis-prevent
            className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-ivory shadow-[var(--shadow-lift)] outline-none"
            initial={reduce ? { opacity: 0 } : { x: rtl ? "-100%" : "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: rtl ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg">{labels.title}</h2>
              <button type="button" className="icon-btn" onClick={() => cart.setOpen(false)} aria-label={labels.close}>
                <X className="size-5" aria-hidden />
              </button>
            </div>

            {cart.items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="size-10 text-muted" aria-hidden />
                <p className="text-muted">{labels.empty}</p>
                <Link href={`/${locale}/categories`} className="btn btn-primary" onClick={() => cart.setOpen(false)}>
                  {labels.emptyCta}
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                  {cart.items.map((item) => (
                    <li key={item.slug} className="flex items-center gap-4 py-4">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                        {item.image !== null && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/${locale}/d/${item.slug}`}
                          className="block truncate font-semibold hover:text-saffron-strong"
                          onClick={() => cart.setOpen(false)}
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-ink-soft">{formatPrice(item.salePriceMinor ?? item.priceMinor, locale)}</p>
                      </div>
                      <button
                        type="button"
                        className="icon-btn text-muted hover:text-danger"
                        onClick={() => cart.remove(item.slug)}
                        aria-label={`${labels.remove}: ${item.name}`}
                      >
                        <Trash2 className="size-5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="space-y-3 border-t border-line px-5 py-5">
                  <div className="flex items-center justify-between text-lg">
                    <span>{labels.subtotal}</span>
                    <span className="font-semibold">{formatPrice(cartSubtotal(cart.items), locale)}</span>
                  </div>
                  <Link href={`/${locale}/checkout`} className="btn btn-primary w-full" onClick={() => cart.setOpen(false)}>
                    {labels.checkout}
                  </Link>
                  <Link href={`/${locale}/cart`} className="btn btn-ghost w-full" onClick={() => cart.setOpen(false)}>
                    {labels.viewCart}
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
