import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/features/admin/AdminShell";
import { adminApi, type AdminMe } from "@/features/admin/adminApi";

type Attention = { attention: { awaiting: number; proofs: number; messages: number } };

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const me = await adminApi<AdminMe>("/v1/admin/auth/me");
  const pathname = (await headers()).get("x-pathname") ?? "";

  // First login with the bootstrap password: nothing else is reachable until it changes.
  if (me.mustChangePassword && !pathname.startsWith("/admin/account")) redirect("/admin/account?force=1");

  const badges: Record<string, number> = {};
  if (!me.mustChangePassword) {
    const overview = await adminApi<Attention>("/v1/admin/overview?days=7").catch(() => null);
    if (overview !== null) {
      badges["/admin/orders"] = overview.attention.awaiting + overview.attention.proofs;
      badges["/admin/messages"] = overview.attention.messages;
    }
  }

  return (
    <AdminShell email={me.email} badges={badges}>
      {children}
    </AdminShell>
  );
}
