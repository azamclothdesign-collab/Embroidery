"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { accountCopy } from "@/constants/accountCopy";
import { accountLoginHref } from "@/constants/siteNavigation";
import {
  useCustomerSession,
  useCustomerSessionReady,
} from "@/hooks/useCustomerSession";
import { notifyCartUpdated } from "@/lib/session/cartSession";
import { notifyCustomerAuthUpdated } from "@/lib/session/customerAuth";
import { notifyWishlistUpdated } from "@/lib/session/wishlistSession";
import { logoutCustomerAction } from "@/server/actions/customerAuthActions";

type AccountAsideAuthProps = {
  locale: string;
  nextPath: string;
};

export function AccountAsideAuth({ locale, nextPath }: AccountAsideAuthProps) {
  const router = useRouter();
  const session = useCustomerSession();
  const isReady = useCustomerSessionReady();

  if (!isReady) {
    return null;
  }

  if (session === null) {
    return (
      <Link
        href={`/${locale}${accountLoginHref}?next=${encodeURIComponent(nextPath)}`}
        className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] text-ink underline-offset-4 hover:underline"
      >
        {accountCopy.signIn}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="min-h-11 text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
      onClick={() => {
        void logoutCustomerAction().then(() => {
          notifyCustomerAuthUpdated();
          notifyCartUpdated();
          notifyWishlistUpdated();
          router.push(`/${locale}${accountLoginHref}`);
        });
      }}
    >
      {accountCopy.signOut}
    </button>
  );
}
