import Link from "next/link";

import { FooterNewsletterForm } from "@/components/FooterNewsletterForm";
import { businessContact } from "@/constants/businessContact";
import {
  footerCopy,
  footerHref,
  footerLegalLinks,
  footerNavGroups,
} from "@/constants/footer";
import { defaultLocale } from "@/constants/locales";
import { fetchSiteGlobal } from "@/lib/api/siteSettingsApi";

type SiteFooterProps = {
  locale?: string;
};

export async function SiteFooter({ locale = defaultLocale }: SiteFooterProps) {
  let contactEmail = businessContact.email;
  let contactPhone = businessContact.phone;
  let contactAddress = "";
  let brandName: string = footerCopy.brand;
  let tagline: string = footerCopy.tagline;

  try {
    const global = await fetchSiteGlobal();
    contactEmail = global.contactEmail.trim() || businessContact.email;
    contactPhone = global.contactPhone.trim() || businessContact.phone;
    contactAddress = global.contactAddress.trim();
    brandName =
      global.brandName.trim().length > 0 ? global.brandName.trim() : brandName;
    tagline =
      global.tagline.trim().length > 0 ? global.tagline.trim() : tagline;
  } catch {
    // Keep footer constants when CMS is unavailable.
  }

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <p className="font-nourd text-h3 font-medium tracking-tight">
              {brandName}
            </p>
            <p className="mt-6 max-w-sm text-body leading-8 text-paper/80">
              {tagline}
            </p>
            <ul className="mt-6 flex list-none flex-col gap-2 p-0 text-body text-paper/80">
              <li>
                <a
                  href={`mailto:${contactEmail}`}
                  className="underline-offset-4 hover:underline"
                >
                  {contactEmail}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="underline-offset-4 hover:underline"
                >
                  {contactPhone}
                </a>
              </li>
              {contactAddress.length > 0 ? (
                <li className="whitespace-pre-line">{contactAddress}</li>
              ) : null}
            </ul>
          </div>
          {footerNavGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-meta uppercase tracking-[0.22em] text-accent">
                {group.title}
              </p>
              <ul className="mt-5 list-none p-0">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={footerHref(locale, link.href)}
                      className="inline-flex min-h-11 items-center text-body text-paper/90"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-16 max-w-md border-t border-paper/20 pt-10 lg:max-w-lg">
          <p className="text-meta uppercase tracking-[0.22em] text-accent">
            {footerCopy.newsletterHeading}
          </p>
          <p className="mt-4 text-body leading-8 text-paper/80">
            {footerCopy.newsletterBody}
          </p>
          <FooterNewsletterForm />
        </div>
      </div>
      <div className="border-t border-paper/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-meta uppercase tracking-[0.16em] text-paper/70">
            © {footerCopy.copyrightYear} {brandName}
          </p>
          <nav aria-label="Legal">
            <ul className="flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
              {footerLegalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={footerHref(locale, link.href)}
                    className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.16em] text-paper/70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
