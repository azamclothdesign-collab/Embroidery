import { type ReactNode } from "react";
import Link from "next/link";

import { accountCopy } from "@/constants/accountCopy";
import {
  type AccountNavId,
  accountNavItems,
} from "@/constants/accountNav";
import { AccountAsideAuth } from "@/features/account/AccountAsideAuth";

type AccountShellProps = {
  locale: string;
  activeId: AccountNavId;
  children: ReactNode;
};

export function AccountShell({ locale, activeId, children }: AccountShellProps) {
  const activeItem = accountNavItems.find((item) => item.id === activeId);
  const activeLabel = activeItem?.label ?? accountCopy.navLabel;
  const nextPath = `/${locale}${activeItem?.href ?? "/account"}`;

  const navList = (
    <ul className="flex list-none flex-col gap-1 p-0">
      {accountNavItems.map((item) => {
        const href = `/${locale}${item.href}`;
        const current = item.id === activeId;

        return (
          <li key={item.id}>
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className={
                current
                  ? "flex min-h-11 items-center px-3 text-meta uppercase tracking-[0.14em] text-ink"
                  : "flex min-h-11 items-center px-3 text-meta uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="mx-auto w-full max-w-[85rem] px-6 py-10 md:py-14">
      <div className="mb-8 lg:hidden">
        <details className="account-nav-menu border border-line bg-surface">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-meta uppercase tracking-[0.14em] text-ink [&::-webkit-details-marker]:hidden">
            <span>
              {accountCopy.navLabel} · {activeLabel}
            </span>
            <span aria-hidden="true">▼</span>
          </summary>
          <div className="border-t border-line px-3 py-4">
            <nav aria-label={accountCopy.navLabel}>{navList}</nav>
            <div className="mt-6 border-t border-line px-3 pt-6">
              <AccountAsideAuth locale={locale} nextPath={nextPath} />
            </div>
          </div>
        </details>
      </div>

      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
        <aside className="accountNav hidden lg:block">
          <p className="px-3 text-meta uppercase tracking-[0.22em] text-accent">
            {accountCopy.navLabel}
          </p>
          <nav aria-label={accountCopy.navLabel} className="mt-6">
            {navList}
          </nav>
          <div className="mt-8 border-t border-line px-3 pt-6">
            <AccountAsideAuth locale={locale} nextPath={nextPath} />
          </div>
        </aside>

        <div className="accountContent min-w-0">{children}</div>
      </div>
    </div>
  );
}
