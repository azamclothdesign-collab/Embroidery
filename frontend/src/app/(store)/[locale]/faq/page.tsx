import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { FaqList } from "@/features/store/components/Sections";
import { StitchLine } from "@/features/store/components/StitchLine";
import { getStorefront } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { pick } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const storefront = await getStorefront();
  const first = storefront.faq.items[0];
  return buildMetadata({
    locale,
    path: "/faq",
    title: t.home.faqTitle,
    description: first === undefined ? t.home.faqTitle : `${pick(first.q, locale)} ${pick(first.a, locale)}`,
    storefront,
  });
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const { faq } = await getStorefront();
  return (
    <div className="container-page max-w-3xl py-12 sm:py-16">
      <h1 className="text-4xl sm:text-5xl">{t.home.faqTitle}</h1>
      <StitchLine className="mt-3 mb-10" />
      <FaqList items={faq.items} locale={locale} />
      <p className="mt-8 text-ink-soft">
        <Link href={`/${locale}/contact`} className="link">
          {t.nav.contact}
        </Link>
      </p>
      <JsonLd data={faqJsonLd(faq.items, locale)} />
    </div>
  );
}
