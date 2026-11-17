import type { MetadataRoute } from "next";
import { api } from "@/lib/api.server";
import { absoluteUrl } from "@/lib/site";

type SitemapData = {
  products: Array<{ slug: string; updatedAt: string }>;
  categories: Array<{ slug: string; updatedAt: string }>;
  pages: Array<{ slug: string; updatedAt: string }>;
};

export const dynamic = "force-dynamic";

/** Every public URL in both languages, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await api<SitemapData>("/v1/sitemap");
  const entry = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(`/en${path}`),
    ...(lastModified === undefined ? {} : { lastModified }),
    priority,
    alternates: { languages: { en: absoluteUrl(`/en${path}`), ur: absoluteUrl(`/ur${path}`) } },
  });

  return [
    entry("", undefined, 1),
    entry("/categories", undefined, 0.9),
    entry("/designs", undefined, 0.8),
    entry("/faq", undefined, 0.5),
    entry("/contact", undefined, 0.4),
    ...data.categories.map((c) => entry(`/c/${c.slug}`, c.updatedAt, 0.8)),
    ...data.products.map((p) => entry(`/d/${p.slug}`, p.updatedAt, 0.7)),
    ...data.pages.map((p) => entry(`/p/${p.slug}`, p.updatedAt, 0.3)),
  ];
}
