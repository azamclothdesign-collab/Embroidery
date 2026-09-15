import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { type MachineSelection } from "@/constants/machineCompatibilityCatalog";
import { machineCompatibilityPageCopy } from "@/constants/machineCompatibilityPageCopy";
import {
  formatShopPrice,
  productPackageLabel,
  type ShopProduct,
  shopProductHref,
} from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";

type MachineRelatedDesignsProps = {
  locale: string;
  products: readonly ShopProduct[];
  selection: MachineSelection | null;
};

export function MachineRelatedDesigns({
  locale,
  products,
  selection,
}: MachineRelatedDesignsProps) {
  const format = selection?.format;
  const filteredProducts =
    format === undefined
      ? products
      : products.filter((product) => product.formats.includes(format));

  return (
    <section
      className="machineReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="related-designs-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {machineCompatibilityPageCopy.relatedEyebrow}
      </p>
      <h2
        id="related-designs-heading"
        className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {machineCompatibilityPageCopy.relatedHeading}
      </h2>
      {format !== undefined ? (
        <p className="mt-4 text-body leading-8 text-ink-soft">
          {machineCompatibilityPageCopy.relatedFormatPrefix} {format}{" "}
          {machineCompatibilityPageCopy.relatedFormatSuffix}
        </p>
      ) : null}

      {filteredProducts.length === 0 ? (
        <p className="mt-8 max-w-2xl text-body leading-8 text-ink-soft">
          {machineCompatibilityPageCopy.relatedEmpty}
        </p>
      ) : (
        <ul className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <li key={product.slug}>
              <Link
                href={shopProductHref(locale, product.slug)}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden bg-line">
                  <CoverImage
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-4 text-h3 font-medium tracking-tight text-ink">
                  {product.name}
                </p>
                <p className="mt-2 text-meta text-ink-soft">
                  {productPackageLabel(product)}
                </p>
                <p className="mt-2 text-body text-ink">
                  {formatShopPrice(product.priceCents)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10">
        <TextLink
          href={
            format === undefined
              ? `/${locale}${shopDesignsHref}`
              : `/${locale}${shopDesignsHref}?q=${encodeURIComponent(format)}`
          }
        >
          {format === undefined
            ? machineCompatibilityPageCopy.browseAll
            : `${machineCompatibilityPageCopy.browseFormatPrefix} ${format} ${machineCompatibilityPageCopy.browseFormatSuffix}`}
        </TextLink>
      </div>
    </section>
  );
}
