import type { Metadata } from "next";
import { adminApi } from "@/features/admin/adminApi";
import { SmtpEditor, StoreEditor } from "@/features/admin/SettingsEditors";
import { PageHeader, Panel, shortDate } from "@/features/admin/ui";
import type { Storefront } from "@/lib/types";

export const metadata: Metadata = { title: "Settings" };

type AuditEntry = { id: string; action: string; detail: Record<string, unknown>; ip: string; adminEmail: string | null; createdAt: string };

export default async function SettingsPage() {
  const [store, smtp, audit] = await Promise.all([
    adminApi<Storefront["store"]>("/v1/admin/settings/store"),
    adminApi<{ host: string; port: number; secure: boolean; user: string; from: string; passSet: boolean }>("/v1/admin/settings/smtp"),
    adminApi<{ items: AuditEntry[] }>("/v1/admin/audit"),
  ]);
  return (
    <>
      <PageHeader title="Settings" />
      <div className="space-y-6">
        <StoreEditor initial={store} />
        <SmtpEditor initial={smtp} />
        <Panel title="Activity log" description="The last 100 admin actions. Secrets are never logged.">
          <ol className="divide-y divide-line text-sm">
            {audit.items.map((entry) => (
              <li key={entry.id} className="flex flex-wrap gap-x-4 gap-y-1 py-2.5">
                <span className="w-40 shrink-0 text-muted">{shortDate(entry.createdAt)}</span>
                <span className="font-semibold">{entry.action}</span>
                <span className="text-ink-soft">{entry.adminEmail ?? "system"}</span>
                {Object.keys(entry.detail).length > 0 && (
                  <code className="min-w-0 flex-1 truncate text-xs text-muted">{JSON.stringify(entry.detail)}</code>
                )}
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
