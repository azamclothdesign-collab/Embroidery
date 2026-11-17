import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { pick, type Locale, type Storefront } from "@/lib/types";
import { CartButton, DesktopNav, LanguageSwitch, MobileMenu, SearchToggle, type NavLink } from "./HeaderControls";
import { BrandMark } from "./StitchLine";

export function Logo({ storefront, locale }: { storefront: Storefront; locale: Locale }) {
  const name = pick(storefront.store.name, locale);
  return (
    <Link href={`/${locale}`} className="flex min-h-11 items-center gap-2.5" aria-label={name}>
      {storefront.store.logo.length > 0 ? (
        <Image src={storefront.store.logo} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />
      ) : (
        <BrandMark className="size-9" />
      )}
      <span className="text-lg font-semibold tracking-tight">{name}</span>
    </Link>
  );
}

export function Header({ storefront, locale, t }: { storefront: Storefront; locale: Locale; t: Dictionary }) {
  const links: NavLink[] = [
    { href: `/${locale}/categories`, label: t.nav.categories },
    { href: `/${locale}/designs`, label: t.nav.designs },
    { href: `/${locale}/track`, label: t.nav.track },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/85 backdrop-blur-md">
      <div className="container-page relative flex h-16 items-center justify-between gap-3 sm:h-[72px]">
        <div className="flex items-center gap-1">
          <MobileMenu links={links} labels={{ menu: t.nav.menu, close: t.nav.close }} />
          <Logo storefront={storefront} locale={locale} />
        </div>
        <nav aria-label="Main">
          <DesktopNav links={links} />
        </nav>
        <div className="flex items-center gap-0.5">
          <SearchToggle locale={locale} label={t.nav.search} close={t.nav.close} />
          <LanguageSwitch locale={locale} labels={{ language: t.nav.language, languageLabel: t.nav.languageLabel }} />
          <CartButton label={t.nav.cart} />
        </div>
      </div>
    </header>
  );
}
