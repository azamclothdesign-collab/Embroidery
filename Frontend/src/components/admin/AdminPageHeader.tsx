import { type ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  body?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  title,
  body,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="admin-product-toolbar mb-2 border-b border-admin-line pb-6">
      <div className="admin-product-toolbar-copy">
        <h1 className="admin-product-title">{title}</h1>
        {body ? <p className="admin-product-sku">{body}</p> : null}
      </div>
      {actions ? (
        <div className="admin-product-toolbar-actions">{actions}</div>
      ) : null}
    </header>
  );
}
