"use client";

import { Languages, Menu, Search, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/features/cart/CartProvider";
import { switchLocalePath } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export type NavLink = { href: string; label: string };

type Labels = { search: string; cart: string; menu: string; close: string; language: string; languageLabel: string };

export function CartButton({ label }: { label: string }) {
  const cart = useCart();
  const count = cart.ready ? cart.items.length : 0;
  return (
    <button type="button" className="icon-btn relative" onClick={() => cart.setOpen(true)} aria-label={`${label} (${count})`}>
      <ShoppingBag className="size-5" aria-hidden />
      {count > 0 && (
        <span className="absolute -end-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-saffron-strong text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

export function LanguageSwitch({ locale, labels }: { locale: Locale; labels: Pick<Labels, "language" | "languageLabel"> }) {
  const pathname = usePathname();
  const target: Locale = locale === "en" ? "ur" : "en";
  return (
    <Link
      href={switchLocalePath(pathname, target)}
      hrefLang={target}
      aria-label={labels.languageLabel}
      onClick={() => {
        document.cookie = `emb_locale=${target}; path=/; max-age=31536000; samesite=lax`;
      }}
      className="btn btn-ghost min-h-11 px-3 text-sm"
    >
      <Languages className="size-4" aria-hidden />
      <span lang={target}>{labels.language}</span>
    </Link>
  );
}

export function SearchToggle({ locale, label, close }: { locale: Locale; label: string; close: string }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      <button type="button" className="icon-btn" aria-label={label} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? <X className="size-5" aria-hidden /> : <Search className="size-5" aria-hidden />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.form
            role="search"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full border-b border-line bg-ivory/95 py-3 backdrop-blur"
            onSubmit={(event) => {
              event.preventDefault();
              const q = inputRef.current?.value.trim() ?? "";
              if (q.length > 0) {
                setOpen(false);
                router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
          >
            <div className="container-page flex gap-2">
              <label htmlFor="site-search" className="sr-only">
                {label}
              </label>
              <input id="site-search" ref={inputRef} type="search" name="q" maxLength={80} placeholder={label} className="field" />
              <button type="submit" className="btn btn-dark" aria-label={label}>
                <Search className="size-5" aria-hidden />
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                {close}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileMenu({ links, labels }: { links: NavLink[]; labels: Pick<Labels, "menu" | "close"> }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="lg:hidden">
      <button type="button" className="icon-btn" aria-label={open ? labels.close : labels.menu} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label={labels.menu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-x-0 top-full overflow-hidden border-b border-line bg-ivory"
          >
            <ul className="container-page flex flex-col py-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center rounded-xl px-3 text-lg font-semibold hover:bg-sand aria-[current=page]:text-saffron-strong"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DesktopNav({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            aria-current={pathname.startsWith(link.href) ? "page" : undefined}
            className="relative inline-flex min-h-11 items-center rounded-full px-4 text-[0.95rem] font-semibold text-ink-soft transition hover:text-ink aria-[current=page]:text-ink"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
