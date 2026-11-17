import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { TrackForm } from "@/features/store/components/Forms";
import { getStorefront } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return buildMetadata({ locale, path: "/track", title: t.track.title, description: t.track.text, storefront: await getStorefront() });
}

export default async function TrackPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const expired = (await searchParams).expired === "1";
  return (
    <div className="container-page max-w-lg py-12 sm:py-16">
      <PackageSearch className="size-10 text-saffron-strong" aria-hidden />
      <h1 className="mt-4 text-4xl">{t.track.title}</h1>
      <p className="mt-3 mb-8 text-ink-soft">{t.track.text}</p>
      {expired && <p className="mb-4 rounded-xl bg-gold-soft px-4 py-3 text-sm font-semibold">{t.order.noAccess}</p>}
      <TrackForm labels={t.track} />
    </div>
  );
}
