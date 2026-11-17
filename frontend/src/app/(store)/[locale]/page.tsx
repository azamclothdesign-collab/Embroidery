import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { HeroText } from "@/features/store/components/HeroText";
import { Marquee } from "@/features/store/components/Marquee";
import { ProductGrid } from "@/features/store/components/ProductCard";
import { CategoryGrid, FaqList, FormatsStrip, HowItWorks, SectionHeader } from "@/features/store/components/Sections";
import { getCategories, getMethods, getProducts, getStorefront } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { pick } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const storefront = await getStorefront();
  return buildMetadata({
    locale,
    path: "",
    title: pick(storefront.store.tagline, locale),
    description: pick(storefront.seo.description, locale),
    storefront,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const storefront = await getStorefront();
  const { home } = storefront;

  const [categories, featured, fresh, sale, methods] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, sort: "new", limit: 4 }),
    home.showNewArrivals ? getProducts({ sort: "new", limit: 8 }) : null,
    home.showSale ? getProducts({ onSale: true, sort: "new", limit: 4 }) : null,
    getMethods(),
  ]);

  return (
    <>
      {/* 1. Centered text hero  2. Slim announcement  3. All categories — in that order (client brief) */}
      <HeroText
        heading={pick(home.heading, locale)}
        text={pick(home.text, locale)}
        primary={{ href: "#categories", label: pick(home.primaryCta, locale) }}
        secondary={{ href: `/${locale}/designs`, label: pick(home.secondaryCta, locale) }}
        trust={{ instant: t.home.trustInstant, secure: t.home.trustSecure, formats: t.home.trustFormats }}
      />
      <Marquee announcement={storefront.announcement} locale={locale} />

      <section id="categories" className="scroll-mt-20 pt-5 pb-12 sm:pt-6 sm:pb-16" aria-labelledby="categories-title">
        <div className="container-page">
          <div data-reveal className="mb-4 sm:mb-5">
            <h2 id="categories-title" className="text-[1.45rem] leading-tight sm:text-[1.85rem]">
              {t.home.categoriesTitle}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-ink-soft">{t.home.categoriesText}</p>
          </div>
          <CategoryGrid categories={categories} locale={locale} t={t} />
        </div>
      </section>

      {featured.items.length > 0 && (
        <section className="section pt-0">
          <div className="container-page">
            <SectionHeader title={t.home.featuredTitle} />
            <ProductGrid products={featured.items} locale={locale} t={t} />
          </div>
        </section>
      )}

      {fresh !== null && fresh.items.length > 0 && (
        <section className="section pt-0">
          <div className="container-page">
            <SectionHeader title={t.home.newTitle} href={`/${locale}/designs`} linkLabel={t.home.viewAll} />
            <ProductGrid products={fresh.items} locale={locale} t={t} />
          </div>
        </section>
      )}

      {sale !== null && sale.items.length > 0 && (
        <section className="section bg-gold-soft/60">
          <div className="container-page">
            <SectionHeader title={t.home.saleTitle} href={`/${locale}/designs?sale=1`} linkLabel={t.home.viewAll} />
            <ProductGrid products={sale.items} locale={locale} t={t} />
          </div>
        </section>
      )}

      {home.showHowItWorks && <HowItWorks t={t} />}
      {home.showFormats && <FormatsStrip t={t} />}

      {home.showFaq && storefront.faq.items.length > 0 && (
        <section className="section pt-0" aria-labelledby="faq-title">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div data-reveal>
              <h2 id="faq-title" className="section-title">
                {t.home.faqTitle}
              </h2>
              {methods.length > 0 && (
                <div className="mt-8">
                  <p className="font-semibold">{t.home.paymentsTitle}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {methods.map((method) => (
                      <li key={method.code} className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-semibold">
                        {pick(method.label, locale)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <FaqList items={storefront.faq.items.slice(0, 5)} locale={locale} />
          </div>
          <JsonLd data={faqJsonLd(storefront.faq.items, locale)} />
        </section>
      )}
    </>
  );
}
