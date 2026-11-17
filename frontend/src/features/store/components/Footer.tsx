import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { pick, type Locale, type PublicMethod, type Storefront } from "@/lib/types";
import { Logo } from "./Header";
import { StitchLine } from "./StitchLine";

export function Footer({
  storefront,
  methods,
  locale,
  t,
}: {
  storefront: Storefront;
  methods: PublicMethod[];
  locale: Locale;
  t: Dictionary;
}) {
  const { store } = storefront;
  const social = [
    { href: store.social.facebook, label: "Facebook", Icon: Facebook },
    { href: store.social.instagram, label: "Instagram", Icon: Instagram },
    { href: store.social.youtube, label: "YouTube", Icon: Youtube },
  ].filter((item) => item.href.startsWith("https://"));

  return (
    <footer className="mt-10 border-t border-line bg-paper">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo storefront={storefront} locale={locale} />
          <p className="max-w-xs text-sm text-ink-soft">{pick(store.tagline, locale)}</p>
          <StitchLine animated={false} className="w-32" />
          <ul className="space-y-2 text-sm text-ink-soft">
            {store.email && (
              <li className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden />
                <a href={`mailto:${store.email}`} className="hover:text-ink">{store.email}</a>
              </li>
            )}
            {store.phone && (
              <li className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden />
                <a href={`tel:${store.phone.replaceAll(" ", "")}`} className="hover:text-ink" dir="ltr">{store.phone}</a>
              </li>
            )}
            <li className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden />
              {pick(store.address, locale)}
            </li>
          </ul>
        </div>

        <FooterColumn
          title={t.footer.shop}
          links={[
            { href: `/${locale}/categories`, label: t.nav.categories },
            { href: `/${locale}/designs`, label: t.nav.designs },
            { href: `/${locale}/designs?sale=1`, label: t.listing.onSale },
          ]}
        />
        <FooterColumn
          title={t.footer.help}
          links={[
            { href: `/${locale}/track`, label: t.nav.track },
            { href: `/${locale}/faq`, label: t.nav.faq },
            { href: `/${locale}/contact`, label: t.nav.contact },
          ]}
        />
        <FooterColumn
          title={t.footer.legal}
          links={storefront.pages.map((page) => ({ href: `/${locale}/p/${page.slug}`, label: pick(page.title, locale) }))}
        />
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {pick(store.name, locale)}. {t.footer.rights}
          </p>
          {methods.length > 0 && (
            <ul className="flex flex-wrap items-center gap-2" aria-label={t.footer.payments}>
              {methods.map((method) => (
                <li key={method.code} className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink-soft">
                  {method.code === "payfast" ? "Cards" : pick(method.label, locale)}
                </li>
              ))}
            </ul>
          )}
          {social.length > 0 && (
            <ul className="flex gap-1">
              {social.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} className="icon-btn" aria-label={label} rel="noopener noreferrer" target="_blank">
                    <Icon className="size-5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="inline-flex min-h-9 items-center text-ink-soft hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
