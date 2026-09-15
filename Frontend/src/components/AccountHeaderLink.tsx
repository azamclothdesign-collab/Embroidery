"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserIcon } from "@/components/icons/UserIcon";
import {
  accountHref,
  accountLoginHref,
} from "@/constants/siteNavigation";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { useIsClient } from "@/hooks/useIsClient";

type AccountHeaderLinkProps = {
  locale: string;
  className?: string;
  iconOnly?: boolean;
  onNavigate?: () => void;
};

export function AccountHeaderLink({
  locale,
  className = "inline-flex size-11 items-center justify-center",
  iconOnly = true,
  onNavigate,
}: AccountHeaderLinkProps) {
  const pathname = usePathname();
  const isClient = useIsClient();
  const session = useCustomerSession();
  const next = encodeURIComponent(pathname);
  const linkProps =
    onNavigate === undefined
      ? {}
      : {
          onClick: () => {
            onNavigate();
          },
        };

  // Keep SSR and first client paint identical; reveal session only after mount.
  if (isClient && session !== null) {
    const label =
      session.firstName.trim().length > 0
        ? session.firstName
        : "Account";

    return (
      <Link
        href={`/${locale}${accountHref}`}
        className={className}
        aria-label={`Account for ${session.email}`}
        {...linkProps}
      >
        {iconOnly ? <UserIcon /> : label}
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}${accountLoginHref}?next=${next}`}
      className={className}
      aria-label="Sign In"
      {...linkProps}
    >
      {iconOnly ? <UserIcon /> : "Sign In"}
    </Link>
  );
}
