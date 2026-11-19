import Link from "next/link";
import { ImageOff } from "lucide-react";
import { AddToCartButton } from "@/features/cart/AddToCartButton";
import type { Dictionary } from "@/lib/i18n";
import { mediaUrl } from "@/lib/mediaLoader";
import { pick, type Locale, type Product } from "@/lib/types";
import { Price } from "./Price";

export function ProductCard({ product, locale, t, priority = false }: { product: Product; locale: Locale; t: Dictionary; priority?: boolean }) {
  const name = pick(product.name, locale);
  const image = product.images[0] ?? null;
  const href = `/${locale}/d/${product.slug}`;
  const onSale = product.salePriceMinor !== null;

  return (
    <article className="group relative flex flex-col">
      <Link href={href} className="relative block overflow-hidden rounded-[var(--radius-card)] bg-sand" aria-label={name}>
        <div className="relative aspect-square">
          {image !== null ? (
            // eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP; avoid next/image clipping tall designs
            <img
              src={mediaUrl(image, 800)}
              alt={name}
              decoding="async"
              {...(priority ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
              className="absolute inset-0 h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.04]"
              srcSet={`${mediaUrl(image, 400)} 400w, ${mediaUrl(image, 800)} 800w, ${mediaUrl(image, 1600)} 1600w`}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted">
              <ImageOff className="size-7" aria-hidden />
              <span className="text-xs">{t.product.noImage}</span>
            </div>
          )}
        </div>
        {onSale && (
          <span className="absolute start-3 top-3 rounded-md bg-gold px-2 py-0.5 text-xs font-semibold text-ink">{t.product.sale}</span>
        )}
      </Link>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[0.98rem] font-semibold">
            <Link href={href} className="hover:text-saffron-strong">
              {name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted">{product.formats.slice(0, 4).join(" · ")}</p>
          <div className="mt-1.5">
            <Price priceMinor={product.priceMinor} salePriceMinor={product.salePriceMinor} locale={locale} />
          </div>
        </div>
        <AddToCartButton
          item={{ slug: product.slug, name, image, priceMinor: product.priceMinor, salePriceMinor: product.salePriceMinor }}
          labels={{ add: t.product.addToCart, added: t.product.added, inCart: t.product.inCart }}
        />
      </div>
    </article>
  );
}

export function ProductGrid({ products, locale, t, priorityCount = 0 }: { products: Product[]; locale: Locale; t: Dictionary; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, index) => (
        <li key={product.id} data-reveal-item>
          <ProductCard product={product} locale={locale} t={t} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
