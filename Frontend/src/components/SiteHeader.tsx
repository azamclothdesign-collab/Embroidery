import Link from "next/link";

import { AccountHeaderLink } from "@/components/AccountHeaderLink";
import { HeaderCartPulse } from "@/components/HeaderCartPulse";
import { HeaderWishlistHeart } from "@/components/HeaderWishlistHeart";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { MenuIcon } from "@/components/icons/MenuIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { defaultLocale } from "@/constants/locales";
import {
  cartHref,
  primaryNavItems,
  shopDesignsHref,
  wishlistHref,
} from "@/constants/siteNavigation";

type SiteHeaderProps = {
  locale?: string;
  overlay?: boolean;
  mutedNav?: boolean;
  secureNote?: string;
};

export function SiteHeader({
  locale = defaultLocale,
  overlay = false,
  mutedNav = false,
  secureNote,
}: SiteHeaderProps) {
  const localeRoot = `/${locale}`;

  return (
    <header
      id="site-header"
      className={
        overlay
          ? "site-header-overlay fixed inset-x-0 top-0 z-40 h-header-compact text-paper lg:h-header"
          : "relative sticky top-0 z-40 h-header-compact bg-paper text-ink"
      }
    >
      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-6">
        <Link
          href={localeRoot}
          className="headerIntro min-w-0 truncate font-nourd text-lg tracking-[0.14em]"
        >
          Embroidery
        </Link>
        <nav
          aria-label="Primary"
          className={
            mutedNav
              ? "headerIntro hidden text-ink-soft lg:block"
              : "headerIntro hidden lg:block"
          }
        >
          <ul className="flex items-center gap-8 text-meta uppercase tracking-[0.16em]">
            {primaryNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={`${localeRoot}${item.href}`}
                  className="inline-flex min-h-11 items-center"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="headerIntro flex shrink-0 items-center gap-1 sm:gap-2">
          {secureNote === undefined ? null : (
            <p className="mr-2 hidden text-meta uppercase tracking-[0.14em] text-ink-soft xl:block">
              {secureNote}
            </p>
          )}
          <Link
            href={`${localeRoot}${shopDesignsHref}`}
            className="hidden size-11 items-center justify-center lg:inline-flex"
            aria-label="Search designs"
          >
            <SearchIcon />
          </Link>
          <HeaderWishlistHeart
            href={`${localeRoot}${wishlistHref}`}
            label="Wishlist"
            overlay={overlay}
            className="inline-flex size-11 items-center justify-center"
          />
          <HeaderCartPulse
            href={`${localeRoot}${cartHref}`}
            overlay={overlay}
            className="inline-flex size-11 items-center justify-center"
          />
          <AccountHeaderLink locale={locale} />
          <details className="site-header-menu lg:hidden">
            <summary className="inline-flex size-11 cursor-pointer items-center justify-center [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Menu</span>
              <span className="site-header-menu-closed">
                <MenuIcon />
              </span>
              <span className="site-header-menu-open">
                <CloseIcon />
              </span>
            </summary>
            <nav
              id="mobile-navigation"
              aria-label="Primary mobile"
              className="absolute inset-x-0 top-full border-t border-line bg-paper px-6 text-ink"
            >
              <ul className="flex flex-col gap-2 py-4 text-meta uppercase tracking-[0.16em]">
                {primaryNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`${localeRoot}${item.href}`}
                      className="flex min-h-11 items-center"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
