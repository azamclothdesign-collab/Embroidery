"use client";

import {
  CreditCard,
  ExternalLink,
  FileText,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PanelsTopLeft,
  Receipt,
  Settings,
  TicketPercent,
  UserCog,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logoutAction } from "@/actions/adminAuth";
import { cn } from "@/lib/cn";
import { BrandMark } from "@/features/store/components/StitchLine";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/products", label: "Designs", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/content", label: "Storefront", icon: PanelsTopLeft },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/account", label: "Account", icon: UserCog },
];

export function AdminShell({ email, badges, children }: { email: string; badges: Record<string, number>; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact === true ? pathname === href : pathname.startsWith(href);
        const badge = badges[href] ?? 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-semibold transition",
              active ? "bg-ink text-white" : "text-ink-soft hover:bg-sand hover:text-ink",
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20" : "bg-saffron-strong text-white")}>{badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-line p-3">
      <Link href="/en" target="_blank" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-sand">
        <ExternalLink className="size-4" aria-hidden />
        View store
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-sand">
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-xs text-muted" title={email}>{email}</p>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-e border-line bg-paper lg:flex">
        <Link href="/admin" className="flex h-16 items-center gap-2.5 border-b border-line px-5 font-semibold">
          <BrandMark className="size-8" />
          Store admin
        </Link>
        <div className="flex flex-1 flex-col overflow-y-auto">{nav}</div>
        {footer}
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/95 px-3 backdrop-blur lg:hidden">
        <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          <Menu className="size-5" aria-hidden />
        </button>
        <span className="font-semibold">Store admin</span>
        <span className="size-11" />
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 flex w-72 flex-col bg-paper">
            <div className="flex h-14 items-center justify-between border-b border-line px-3">
              <span className="px-2 font-semibold">Menu</span>
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">{nav}</div>
            {footer}
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
