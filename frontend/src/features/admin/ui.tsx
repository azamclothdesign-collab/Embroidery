import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl">{title}</h1>
        {description !== undefined && <p className="mt-1 text-ink-soft">{description}</p>}
      </div>
      {actions !== undefined && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, { wrap: string; dot: string }> = {
  paid: { wrap: "bg-teal-soft/80 text-teal ring-teal/15", dot: "bg-teal" },
  published: { wrap: "bg-teal-soft/80 text-teal ring-teal/15", dot: "bg-teal" },
  approved: { wrap: "bg-teal-soft/80 text-teal ring-teal/15", dot: "bg-teal" },
  pending_payment: { wrap: "bg-gold-soft/90 text-ink ring-gold/25", dot: "bg-gold" },
  awaiting_verification: { wrap: "bg-saffron-soft/90 text-saffron-strong ring-saffron/20", dot: "bg-saffron" },
  pending: { wrap: "bg-saffron-soft/90 text-saffron-strong ring-saffron/20", dot: "bg-saffron" },
  draft: { wrap: "bg-sand text-ink-soft ring-line", dot: "bg-muted" },
  failed: { wrap: "bg-danger-soft text-danger ring-danger/15", dot: "bg-danger" },
  rejected: { wrap: "bg-danger-soft text-danger ring-danger/15", dot: "bg-danger" },
  cancelled: { wrap: "bg-sand text-muted ring-line", dot: "bg-muted" },
  archived: { wrap: "bg-sand text-muted ring-line", dot: "bg-muted" },
  refunded: { wrap: "bg-sand text-muted ring-line", dot: "bg-muted" },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { wrap: "bg-sand text-ink-soft ring-line", dot: "bg-muted" };
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold leading-none tracking-wide capitalize ring-1 ring-inset",
        style.wrap,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} aria-hidden />
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function Panel({ title, description, children, className }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card p-5 sm:p-6", className)}>
      {title !== undefined && <h2 className="text-lg">{title}</h2>}
      {description !== undefined && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      <div className={title !== undefined || description !== undefined ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {text !== undefined && <p className="max-w-md text-ink-soft">{text}</p>}
      {action}
    </div>
  );
}

export const rupees = (minor: number) => `Rs ${(minor / 100).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;

export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" }).format(new Date(iso));
