"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { MenuIcon } from "@/components/icons/MenuIcon";
import { adminCopy } from "@/constants/adminCopy";
import { adminLoginHref, adminProductNewHref } from "@/constants/adminNav";
import { notifyAdminAuthUpdated } from "@/lib/session/adminAuth";
import { logoutAdminAction } from "@/server/actions/adminAuthActions";

type AdminTopBarProps = {
  locale: string;
  onMenuToggle: () => void;
  menuOpen: boolean;
};

export function AdminTopBar({
  locale,
  onMenuToggle,
  menuOpen,
}: AdminTopBarProps) {
  const router = useRouter();
  const [menuOpenLocal, setMenuOpenLocal] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-admin-line/80 bg-admin-surface-glass backdrop-blur-md">
      <div className="flex h-[4.25rem] items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center border border-admin-line bg-admin-surface text-admin-ink transition-colors hover:bg-admin-input lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-nav"
            onClick={onMenuToggle}
          >
            <span className="sr-only">
              {menuOpen ? adminCopy.closeMenu : adminCopy.openMenu}
            </span>
            <MenuIcon />
          </button>
          <p className="hidden text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-admin-ink-soft sm:block lg:hidden">
            {adminCopy.sidebarLabel}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={`/${locale}${adminProductNewHref}`}
            className="admin-product-cta hidden md:inline-flex"
          >
            {adminCopy.topBarCreate}
          </Link>

          <div className="relative">
            <button
              type="button"
              className="admin-product-ghost gap-2"
              aria-expanded={menuOpenLocal}
              onClick={() => {
                setMenuOpenLocal((open) => !open);
              }}
            >
              <span
                aria-hidden="true"
                className="inline-flex size-6 items-center justify-center bg-admin-nav font-nourd text-[10px] font-semibold text-white"
              >
                A
              </span>
              <span>{adminCopy.adminMenu}</span>
            </button>
            {menuOpenLocal ? (
              <div className="absolute right-0 top-full z-20 mt-2 w-52 border border-admin-line bg-admin-surface px-1 py-1 font-nourd text-[13px] leading-5 text-admin-ink shadow-[0_16px_40px_rgb(17_17_17/0.12)]">
                <button
                  type="button"
                  className="w-full px-3 py-2.5 text-left text-admin-error transition-colors hover:bg-admin-error/8"
                  onClick={() => {
                    void logoutAdminAction().then(() => {
                      notifyAdminAuthUpdated();
                      router.replace(`/${locale}${adminLoginHref}`);
                    });
                  }}
                >
                  {adminCopy.signOut}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
