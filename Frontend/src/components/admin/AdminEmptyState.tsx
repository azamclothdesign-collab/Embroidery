import { type ReactNode } from "react";

type AdminEmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function AdminEmptyState({ title, body, action }: AdminEmptyStateProps) {
  return (
    <div className="admin-panel flex flex-col items-start gap-4 px-6 py-10 md:px-8">
      <div className="h-1 w-10 bg-admin-accent" aria-hidden="true" />
      <h2 className="text-xl font-semibold tracking-tight text-admin-ink">
        {title}
      </h2>
      <p className="max-w-xl text-[0.9375rem] leading-7 text-admin-ink-soft">
        {body}
      </p>
      {action === undefined ? null : <div className="mt-2">{action}</div>}
    </div>
  );
}
