import { type ReactNode } from "react";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { type AccountNavId } from "@/constants/accountNav";
import { AccountShell } from "@/features/account/AccountShell";

type AccountPageFrameProps = {
  locale: string;
  activeId: AccountNavId;
  children: ReactNode;
};

export function AccountPageFrame({
  locale,
  activeId,
  children,
}: AccountPageFrameProps) {
  return (
    <>
      <SiteHeader locale={locale} />
      <PageEnter>
        <AccountShell locale={locale} activeId={activeId}>
          {children}
        </AccountShell>
      </PageEnter>
    </>
  );
}
