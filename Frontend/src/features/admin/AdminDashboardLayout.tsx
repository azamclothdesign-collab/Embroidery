"use client";

import { type ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAuthGuard } from "@/features/admin/auth/AdminAuthGuard";

type AdminDashboardLayoutProps = {
  locale: string;
  children: ReactNode;
};

export function AdminDashboardLayout({
  locale,
  children,
}: AdminDashboardLayoutProps) {
  return (
    <AdminAuthGuard locale={locale}>
      <AdminShell locale={locale}>{children}</AdminShell>
    </AdminAuthGuard>
  );
}
