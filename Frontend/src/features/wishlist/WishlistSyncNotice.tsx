"use client";

import { TextLink } from "@/components/TextLink";
import { accountHref, accountLoginHref } from "@/constants/siteNavigation";
import { wishlistCopy } from "@/constants/wishlistCopy";
import { useCustomerSession } from "@/hooks/useCustomerSession";

type WishlistSyncNoticeProps = {
  locale: string;
};

export function WishlistSyncNotice({ locale }: WishlistSyncNoticeProps) {
  const session = useCustomerSession();
  const signedIn = session !== null;

  return (
    <div className="wishlistReveal mx-auto w-full max-w-[85rem] px-6 pb-6">
      <div className="flex flex-col gap-3 border border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body leading-7 text-ink-soft">
          {signedIn
            ? wishlistCopy.syncNoticeSignedIn
            : wishlistCopy.syncNotice}
        </p>
        <TextLink
          href={
            signedIn
              ? `/${locale}${accountHref}`
              : `/${locale}${accountLoginHref}?next=${encodeURIComponent(`/${locale}/wishlist`)}`
          }
          tone="ghostOnLight"
        >
          {signedIn ? wishlistCopy.syncCtaAccount : wishlistCopy.syncCta}
        </TextLink>
      </div>
    </div>
  );
}
