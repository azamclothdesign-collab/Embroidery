import type { Metadata } from "next";
import { absoluteUrl } from "./site";
import { pick, type Locale, type Product, type Storefront } from "./types";

type MetaInput = {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/c/neckline" or "" for home. */
  path: string;
  title: string;
  description: string;
  image?: string | null;
  storefront: Storefront;
  noindex?: boolean;
  type?: "website" | "article";
};

export function mediaUrl(path: string | null | undefined, width = 1600): string | null {
  if (path === null || path === undefined || path.length === 0) return null;
  return absoluteUrl(path.startsWith("/media/") ? `${path}-${width}.webp` : path);
}

/** Canonical + hreflang for both languages, Open Graph and Twitter cards. */
export function buildMetadata(input: MetaInput): Metadata {
  const suffix = input.storefront.seo.titleSuffix || pick(input.storefront.store.name, input.locale);
  const title = input.title.length > 0 ? `${input.title} | ${suffix}` : suffix;
  const description = input.description.slice(0, 170);
  const url = absoluteUrl(`/${input.locale}${input.path}`);
  const image = mediaUrl(input.image) ?? absoluteUrl("/og-default.png");
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: absoluteUrl(`/en${input.path}`),
        ur: absoluteUrl(`/ur${input.path}`),
        "x-default": absoluteUrl(`/en${input.path}`),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: pick(input.storefront.store.name, input.locale),
      locale: input.locale === "ur" ? "ur_PK" : "en_PK",
      type: input.type ?? "website",
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    ...(input.noindex === true ? { robots: { index: false, follow: false } } : {}),
  };
}

export function organizationJsonLd(storefront: Storefront, locale: Locale) {
  const store = storefront.store;
  const sameAs = Object.values(store.social).filter((url) => url.startsWith("https://"));
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: pick(store.name, locale),
    url: absoluteUrl(`/${locale}`),
    ...(store.logo.length > 0 ? { logo: mediaUrl(store.logo, 400) } : {}),
    ...(store.email.length > 0 ? { email: store.email } : {}),
    ...(store.phone.length > 0 ? { telephone: store.phone } : {}),
    address: { "@type": "PostalAddress", addressLocality: pick(store.address, locale), addressCountry: "PK" },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd(storefront: Storefront, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: pick(storefront.store.name, locale),
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale === "ur" ? "ur-PK" : "en-PK",
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: absoluteUrl(`/${locale}/search?q={search_term_string}`) },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: Product, locale: Locale) {
  const price = (product.salePriceMinor ?? product.priceMinor) / 100;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/${locale}/d/${product.slug}#product`),
    name: pick(product.name, locale),
    description: pick(product.seoDescription, locale) || pick(product.description, locale).slice(0, 300),
    sku: product.slug,
    category: pick(product.category.name, locale),
    image: product.images.map((image) => mediaUrl(image)).filter((url): url is string => url !== null),
    brand: { "@id": absoluteUrl("/#organization") },
    additionalProperty: [
      { "@type": "PropertyValue", name: "File formats", value: product.formats.join(", ") },
      ...(product.hoopSize ? [{ "@type": "PropertyValue", name: "Hoop size", value: product.hoopSize }] : []),
      ...(product.stitchCount > 0 ? [{ "@type": "PropertyValue", name: "Stitch count", value: product.stitchCount }] : []),
    ],
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/${locale}/d/${product.slug}`),
      priceCurrency: "PKR",
      price: price.toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": absoluteUrl("/#organization") },
    },
  };
}

export function itemListJsonLd(products: Product[], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/${locale}/d/${product.slug}`),
      name: pick(product.name, locale),
    })),
  };
}

export function faqJsonLd(items: Storefront["faq"]["items"], locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: pick(item.q, locale),
      acceptedAnswer: { "@type": "Answer", text: pick(item.a, locale) },
    })),
  };
}

/** Safe JSON for a <script type="application/ld+json"> block. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
