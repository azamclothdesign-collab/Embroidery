import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, Layers, Maximize2, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { Markdown } from "@/components/Markdown";
import { AddToCartButton } from "@/features/cart/AddToCartButton";
import { Gallery } from "@/features/store/components/Gallery";
import { Price } from "@/features/store/components/Price";
import { ProductGrid } from "@/features/store/components/ProductCard";
import { Breadcrumbs } from "@/features/store/components/Sections";
import { getProduct, getStorefront } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";
import { pick } from "@/lib/types";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const [data, storefront] = await Promise.all([getProduct(slug), getStorefront()]);
  if (data === null) return {};
  const { product } = data;
  const name = pick(product.name, locale);
  const price = formatPrice(product.salePriceMinor ?? product.priceMinor, locale);
  return buildMetadata({
    locale,
    path: `/d/${product.slug}`,
    title: pick(product.seoTitle, locale) || `${name} — ${pick(product.category.name, locale)}`,
    description:
      pick(product.seoDescription, locale) ||
      (locale === "ur"
        ? `${name} مشین ایمبرائیڈری ڈیزائن (${product.formats.join("، ")})۔ قیمت ${price}، ادائیگی کے بعد فوری ZIP ڈاؤن لوڈ۔`
        : `${name} machine embroidery design in ${product.formats.join(", ")}. ${price}, instant ZIP download after payment.`),
    image: product.images[0] ?? null,
    storefront,
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const data = await getProduct(slug);
  if (data === null) notFound();
  const { product, related } = data;
  const t = getDictionary(locale);
  const name = pick(product.name, locale);
  const categoryName = pick(product.category.name, locale);
  const description = pick(product.description, locale);
  const cartItem = { slug: product.slug, name, image: product.images[0] ?? null, priceMinor: product.priceMinor, salePriceMinor: product.salePriceMinor };
  const specs = [
    { icon: Layers, label: t.product.formats, value: product.formats.join(" · ") },
    ...(product.hoopSize ? [{ icon: Maximize2, label: t.product.hoop, value: product.hoopSize }] : []),
    ...(product.stitchCount > 0 ? [{ icon: Sparkles, label: t.product.stitches, value: product.stitchCount.toLocaleString("en-US") }] : []),
    { icon: Download, label: t.product.delivery, value: t.product.deliveryValue },
  ];

  return (
    <div className="container-page py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { href: `/${locale}`, label: t.common.breadcrumbHome },
          { href: `/${locale}/c/${product.category.slug}`, label: categoryName },
          { label: name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Gallery images={product.images} alt={name} emptyLabel={t.product.noImage} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{categoryName}</p>
          <h1 className="mt-2 text-3xl sm:text-[2.6rem] sm:leading-tight">{name}</h1>
          <div className="mt-4">
            <Price priceMinor={product.priceMinor} salePriceMinor={product.salePriceMinor} locale={locale} size="lg" saveLabel={t.product.save} />
          </div>

          <div className="mt-6">
            <AddToCartButton
              item={cartItem}
              variant="full"
              checkoutHref={`/${locale}/checkout`}
              labels={{ add: t.product.addToCart, added: t.product.added, inCart: t.product.inCart, buyNow: t.product.buyNow }}
            />
          </div>

          <dl className="mt-8 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-paper">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 px-4 py-3.5 sm:items-center sm:gap-4 sm:px-5">
                <Icon className="mt-0.5 size-5 shrink-0 text-teal sm:mt-0" aria-hidden />
                <dt className="w-20 shrink-0 text-sm text-muted sm:w-28">{label}</dt>
                <dd className="min-w-0 flex-1 break-words font-semibold" dir="auto">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <h2 className="text-lg">{t.product.whatYouGet}</h2>
            <ul className="mt-3 space-y-2">
              {t.product.whatYouGetItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-ink-soft">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {description.length > 0 && <Markdown source={description} className="prose-cms mt-8" />}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related-title">
          <h2 id="related-title" data-reveal className="section-title mb-8">
            {t.product.related}
          </h2>
          <ProductGrid products={related} locale={locale} t={t} />
        </section>
      )}

      <JsonLd
        data={[
          productJsonLd(product, locale),
          breadcrumbJsonLd([
            { name: t.common.breadcrumbHome, path: `/${locale}` },
            { name: categoryName, path: `/${locale}/c/${product.category.slug}` },
            { name, path: `/${locale}/d/${product.slug}` },
          ]),
        ]}
      />
    </div>
  );
}
