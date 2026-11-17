import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { Breadcrumbs } from "@/features/store/components/Sections";
import { StitchLine } from "@/features/store/components/StitchLine";
import { getPage, getStorefront } from "@/features/store/data";
import { formatDate } from "@/lib/format";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { pick } from "@/lib/types";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [page, storefront] = await Promise.all([getPage(slug), getStorefront()]);
  if (page === null) return {};
  return buildMetadata({
    locale,
    path: `/p/${page.slug}`,
    title: pick(page.title, locale),
    description: pick(page.seoDescription, locale) || pick(page.body, locale).replaceAll(/[#*\-\n]+/g, " ").trim().slice(0, 160),
    storefront,
    type: "article",
  });
}

export default async function CmsPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const page = await getPage(slug);
  if (page === null) notFound();
  const t = getDictionary(locale);
  const title = pick(page.title, locale);
  return (
    <article className="container-page max-w-3xl py-10 sm:py-14">
      <Breadcrumbs items={[{ href: `/${locale}`, label: t.common.breadcrumbHome }, { label: title }]} />
      <h1 className="mt-6 text-4xl sm:text-5xl">{title}</h1>
      <StitchLine className="mt-3" />
      <p className="mt-3 text-sm text-muted">
        <time dateTime={page.updatedAt}>{formatDate(page.updatedAt, locale)}</time>
      </p>
      <Markdown source={pick(page.body, locale)} className="prose-cms mt-8" />
    </article>
  );
}
