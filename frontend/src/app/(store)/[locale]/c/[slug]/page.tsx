import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProductListing, listingItems } from "@/features/store/components/ProductListing";
import { Breadcrumbs } from "@/features/store/components/Sections";
import { StitchLine } from "@/features/store/components/StitchLine";
import { getCategory, getStorefront, readListParams } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd } from "@/lib/seo";
import { pick } from "@/lib/types";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [category, storefront, query] = await Promise.all([getCategory(slug), getStorefront(), searchParams]);
  if (category === null) return {};
  const name = pick(category.name, locale);
  const filtered = Object.keys(query).length > 0;
  return buildMetadata({
    locale,
    path: `/c/${category.slug}`,
    title: pick(category.seoTitle, locale) || name,
    description:
      pick(category.seoDescription, locale) ||
      pick(category.intro, locale) ||
      (locale === "ur"
        ? `${name} — ${category.productCount} مشین ایمبرائیڈری ڈیزائن، فوری ZIP ڈاؤن لوڈ کے ساتھ۔`
        : `${category.productCount} ${name.toLowerCase()} machine embroidery designs in DST and EMB. Secure payment and instant ZIP download.`),
    image: category.image,
    storefront,
    noindex: filtered,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const category = await getCategory(slug);
  if (category === null) notFound();
  const t = getDictionary(locale);
  const query = { ...readListParams(await searchParams), category: category.slug };
  const name = pick(category.name, locale);
  const intro = pick(category.intro, locale);
  const firstPage = await listingItems({ category: category.slug, sort: "new" });

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { href: `/${locale}`, label: t.common.breadcrumbHome },
          { href: `/${locale}/categories`, label: t.nav.categories },
          { label: name },
        ]}
      />
      <header className="mt-6 mb-8 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl">{name}</h1>
        <StitchLine className="mt-3" />
        {/* Answer-first intro: short, quotable summary for search + AI answers */}
        <p className="mt-4 text-lg text-ink-soft">
          {intro.length > 0
            ? intro
            : locale === "ur"
              ? `${category.productCount} ${name} ڈیزائن، ہر ایک تمام عام مشین فارمیٹس کے ساتھ۔ ادائیگی کے فوراً بعد ZIP ڈاؤن لوڈ کریں۔`
              : `${category.productCount} ready-to-stitch ${name.toLowerCase()} designs, each with common machine formats. Download the ZIP right after payment.`}
        </p>
      </header>
      <ProductListing query={query} basePath={`/${locale}/c/${category.slug}`} locale={locale} t={t} />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: t.common.breadcrumbHome, path: `/${locale}` },
            { name: t.nav.categories, path: `/${locale}/categories` },
            { name, path: `/${locale}/c/${category.slug}` },
          ]),
          itemListJsonLd(firstPage, locale),
        ]}
      />
    </div>
  );
}
