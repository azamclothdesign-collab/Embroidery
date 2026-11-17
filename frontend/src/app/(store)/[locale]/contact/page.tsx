import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { ContactForm } from "@/features/store/components/Forms";
import { getStorefront } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { pick } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return buildMetadata({ locale, path: "/contact", title: t.contact.title, description: t.contact.text, storefront: await getStorefront() });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const { store } = await getStorefront();
  const whatsapp = store.whatsapp.replaceAll(/\D/g, "").replace(/^0/, "92");

  return (
    <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="text-4xl sm:text-5xl">{t.contact.title}</h1>
        <p className="mt-4 max-w-md text-lg text-ink-soft">{t.contact.text}</p>
        <ul className="mt-8 space-y-4">
          {store.email && (
            <li className="flex items-center gap-3">
              <Mail className="size-5 text-teal" aria-hidden />
              <a href={`mailto:${store.email}`} className="link">{store.email}</a>
            </li>
          )}
          {store.phone && (
            <li className="flex items-center gap-3">
              <Phone className="size-5 text-teal" aria-hidden />
              <a href={`tel:${store.phone.replaceAll(" ", "")}`} className="link" dir="ltr">{store.phone}</a>
            </li>
          )}
          {whatsapp.length >= 10 && (
            <li className="flex items-center gap-3">
              <MessageCircle className="size-5 text-teal" aria-hidden />
              <a href={`https://wa.me/${whatsapp}`} className="link" target="_blank" rel="noopener noreferrer">{t.contact.whatsapp}</a>
            </li>
          )}
          <li className="flex items-center gap-3">
            <MapPin className="size-5 text-teal" aria-hidden />
            {pick(store.address, locale)}
          </li>
        </ul>
      </div>
      <ContactForm labels={t.contact} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: absoluteUrl(`/${locale}/contact`),
          about: { "@id": absoluteUrl("/#organization") },
        }}
      />
    </div>
  );
}
