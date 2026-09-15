"use client";

import { type ReactNode, useState } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { PageEnter } from "@/components/PageEnter";
import { adminCopy } from "@/constants/adminCopy";

type AdminShellProps = {
  locale: string;
  children: ReactNode;
};

export function AdminShell({ locale, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-app relative flex min-h-svh text-admin-ink selection:bg-admin-accent/30 selection:text-admin-ink font-nourd">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-admin-nav/55 backdrop-blur-[2px] lg:hidden"
          aria-label={adminCopy.closeMenu}
          onClick={() => {
            setMobileOpen(false);
          }}
        />
      ) : null}
      <div id="admin-mobile-nav">
        <AdminSidebar
          locale={locale}
          mobileOpen={mobileOpen}
          onNavigate={() => {
            setMobileOpen(false);
          }}
        />
      </div>
      <div className="admin-app-main z-10 flex min-w-0 flex-1 flex-col lg:ml-[16.5rem]">
        <AdminTopBar
          locale={locale}
          menuOpen={mobileOpen}
          onMenuToggle={() => {
            setMobileOpen((open) => !open);
          }}
        />
        <main className="admin-app-body flex-1 px-5 py-8 md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-[76rem]">
            <PageEnter>{children}</PageEnter>
          </div>
        </main>
      </div>
    </div>
  );
}
