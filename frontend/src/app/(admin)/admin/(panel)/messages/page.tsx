import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { MarkReadButton } from "@/features/admin/MarkReadButton";
import { EmptyState, PageHeader, shortDate } from "@/features/admin/ui";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Messages" };

type Message = { id: string; name: string; email: string; phone: string; message: string; is_read: boolean; created_at: string };

export default async function MessagesPage() {
  const { items } = await adminApi<{ items: Message[] }>("/v1/admin/messages");
  return (
    <>
      <PageHeader title="Messages" description="From the contact form. A copy is also emailed to the support address." />
      {items.length === 0 ? (
        <EmptyState title="No messages yet" />
      ) : (
        <ul className="space-y-3">
          {items.map((m) => (
            <li key={m.id} className={cn("card p-5", !m.is_read && "border-saffron/50 ring-1 ring-saffron/30")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.name} {!m.is_read && <span className="ms-2 rounded bg-saffron-strong px-1.5 py-0.5 text-[10px] text-white">NEW</span>}</p>
                  <p className="text-sm text-ink-soft">
                    <a className="link" href={`mailto:${m.email}`}>{m.email}</a>
                    {m.phone && <> · <a className="link" href={`tel:${m.phone}`}>{m.phone}</a></>}
                  </p>
                </div>
                <span className="text-xs text-muted">{shortDate(m.created_at)}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-ink-soft" dir="auto">{m.message}</p>
              <div className="mt-4 flex gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`} className="btn btn-outline min-h-9 px-3">
                  <Mail className="size-4" aria-hidden /> Reply
                </a>
                {!m.is_read && <MarkReadButton id={m.id} />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
