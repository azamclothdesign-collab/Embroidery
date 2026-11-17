import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs, CategoryGrid } from "@/features/store/components/Sections";
import { StitchLine } from "@/features/store/components/StitchLine";
import { getCategories, getStorefront } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { pick } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const storefront = await getStorefront();
  return buildMetadata({ locale, path: "/categories", title: t.home.categoriesTitle, description: t.home.categoriesText, storefront });
}

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const categories = await getCategories();

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ href: `/${locale}`, label: t.common.breadcrumbHome }, { label: t.nav.categories }]} />
      <header className="mt-6 mb-10 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl">{t.home.categoriesTitle}</h1>
        <StitchLine className="mt-3" />
        <p className="mt-4 text-lg text-ink-soft">{t.home.categoriesText}</p>
      </header>
      <CategoryGrid categories={categories} locale={locale} t={t} />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: t.common.breadcrumbHome, path: `/${locale}` },
            { name: t.nav.categories, path: `/${locale}/categories` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: categories.map((category, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: pick(category.name, locale),
              url: absoluteUrl(`/${locale}/c/${category.slug}`),
            })),
          },
        ]}
      />
    </div>
  );
}
