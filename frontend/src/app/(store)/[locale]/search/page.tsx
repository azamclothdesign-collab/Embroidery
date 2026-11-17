import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { ProductListing } from "@/features/store/components/ProductListing";
import { getStorefront, readListParams } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return buildMetadata({ locale, path: "/search", title: t.nav.search, description: t.nav.search, storefront: await getStorefront(), noindex: true });
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const query = readListParams(await searchParams);

  return (
    <div className="container-page py-10 sm:py-14">
      <form role="search" action={`/${locale}/search`} className="mb-8 flex max-w-xl gap-2">
        <label htmlFor="search-page-q" className="sr-only">
          {t.nav.search}
        </label>
        <input id="search-page-q" name="q" type="search" defaultValue={query.q ?? ""} maxLength={80} placeholder={t.listing.searchPlaceholder} className="field" />
        <button type="submit" className="btn btn-dark" aria-label={t.nav.search}>
          <Search className="size-5" aria-hidden />
        </button>
      </form>
      <h1 className="mb-6 text-3xl sm:text-4xl">{query.q ? t.listing.searchTitle(query.q) : t.nav.search}</h1>
      {query.q ? <ProductListing query={query} basePath={`/${locale}/search`} locale={locale} t={t} /> : null}
    </div>
  );
}
