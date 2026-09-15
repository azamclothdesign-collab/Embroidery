"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminNavIcon } from "@/components/admin/AdminNavIcon";
import { adminCopy } from "@/constants/adminCopy";
import {
  type AdminNavId,
  adminNavItems,
  adminVersionLabel,
  isAdminNavCurrent,
} from "@/constants/adminNav";

type AdminSidebarProps = {
  locale: string;
  mobileOpen: boolean;
  onNavigate: () => void;
};

function SidebarNav({
  localeRoot,
  pathname,
  onNavigate,
}: {
  localeRoot: string;
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
        <span
          aria-hidden="true"
          className="relative inline-flex size-10 items-center justify-center bg-admin-accent font-nourd text-sm font-semibold tracking-tight text-admin-nav"
        >
          E
          <span className="absolute -bottom-px left-0 h-0.5 w-full bg-white/40" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-nourd text-base font-semibold tracking-tight text-white">
            {adminCopy.sidebarBrand}
          </p>
          <p className="truncate text-[0.6875rem] uppercase tracking-[0.18em] text-admin-accent">
            {adminCopy.sidebarLabel}
          </p>
        </div>
      </div>

      <p className="mt-6 px-5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-admin-nav-muted">
        {adminCopy.sidebarMenuGroup}
      </p>

      <ul className="mt-3 flex list-none flex-col gap-0.5 p-0 px-3">
        {adminNavItems.map((item) => {
          const current = isAdminNavCurrent(pathname, localeRoot, item.href);
          const iconId = item.id as AdminNavId;

          return (
            <li key={item.id}>
              <Link
                href={`${localeRoot}${item.href}`}
                aria-current={current ? "page" : undefined}
                className={
                  current
                    ? "relative flex min-h-11 items-center gap-3 bg-[var(--color-admin-nav-active)] px-3 font-nourd text-[14px] font-medium text-white transition-colors before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-admin-accent"
                    : "flex min-h-11 items-center gap-3 bg-transparent px-3 font-nourd text-[14px] text-admin-nav-muted transition-colors hover:bg-[var(--color-admin-nav-hover)] hover:text-white"
                }
                onClick={onNavigate}
              >
                <AdminNavIcon
                  id={iconId}
                  className={`size-[18px] shrink-0 ${current ? "text-admin-accent" : "opacity-80"}`}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto space-y-3 border-t border-white/10 px-3 pb-5 pt-5">
        <p className="px-2 text-[0.6875rem] uppercase tracking-[0.16em] text-admin-nav-muted">
          {adminVersionLabel}
        </p>
        <div className="flex items-center gap-3 bg-white/5 px-3 py-3">
          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center bg-admin-accent font-nourd text-[12px] font-semibold text-admin-nav"
          >
            A
          </span>
          <div className="min-w-0">
            <p className="truncate font-nourd text-[14px] font-medium text-white">
              {adminCopy.adminMenu}
            </p>
            <p className="truncate text-[11px] text-admin-nav-muted">
              {adminCopy.sidebarAccountHint}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({
  locale,
  mobileOpen,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const localeRoot = `/${locale}`;

  return (
    <>
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden w-[16.5rem] flex-col bg-[var(--color-admin-nav)] lg:flex">
        <SidebarNav
          localeRoot={localeRoot}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </aside>
      <aside
        className={`sheet-panel from-left admin-sidebar fixed inset-y-0 left-0 z-40 flex w-[16.5rem] flex-col bg-[var(--color-admin-nav)] shadow-2xl lg:hidden${mobileOpen ? " is-open" : ""}`}
      >
        <SidebarNav
          localeRoot={localeRoot}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </aside>
    </>
  );
}
