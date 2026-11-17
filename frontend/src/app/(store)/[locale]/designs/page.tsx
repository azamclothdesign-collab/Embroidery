import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/features/store/components/ProductListing";
import { Breadcrumbs } from "@/features/store/components/Sections";
import { StitchLine } from "@/features/store/components/StitchLine";
import { getStorefront, readListParams } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { pick } from "@/lib/types";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  const [storefront, query] = await Promise.all([getStorefront(), searchParams]);
  return buildMetadata({
    locale,
    path: "/designs",
    title: t.nav.designs,
    description: pick(storefront.seo.description, locale),
    storefront,
    noindex: Object.keys(query).length > 0,
  });
}

export default async function DesignsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const query = readListParams(await searchParams);

  return (
    <div className="container-page py-10 sm:py-14">
      <Breadcrumbs items={[{ href: `/${locale}`, label: t.common.breadcrumbHome }, { label: t.nav.designs }]} />
      <header className="mt-6 mb-8">
        <h1 className="text-4xl sm:text-5xl">{query.onSale ? t.home.saleTitle : t.nav.designs}</h1>
        <StitchLine className="mt-3" />
      </header>
      <ProductListing query={query} basePath={`/${locale}/designs`} locale={locale} t={t} />
    </div>
  );
}
