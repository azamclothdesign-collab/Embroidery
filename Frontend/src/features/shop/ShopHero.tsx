import { CoverImage } from "@/components/CoverImage";
import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import { fromScreenToStitchCopy } from "@/constants/fromScreenToStitch";
import { type ShopProduct } from "@/constants/shopCatalog";
import { shopCopy } from "@/constants/shopCopy";
import { type ShopCatalogQuery } from "@/features/shop/shopCatalogQuery";
import { ShopSearch } from "@/features/shop/ShopSearch";

type ShopHeroProps = {
  locale: string;
  catalog: ShopCatalogQuery;
  products: readonly ShopProduct[];
};

export function ShopHero({ locale, catalog, products }: ShopHeroProps) {
  return (
    <section className="relative isolate min-h-[20rem] overflow-hidden md:min-h-[24rem] lg:min-h-[28rem]">
      <div className="shopHeroFrame absolute inset-0">
        <CoverImage
          src={fromScreenToStitchPosterSrc}
          alt={fromScreenToStitchCopy.imageAlt}
          sizes="100vw"
          priority
          className="absolute inset-0 size-full max-w-none object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
      <div className="relative mx-auto flex min-h-[20rem] w-full max-w-[85rem] flex-col justify-center px-6 py-12 text-paper md:min-h-[24rem] lg:min-h-[28rem] lg:py-16">
        <p className="shopHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
          {shopCopy.eyebrow}
        </p>
        <h1 className="shopHeroCopy mt-4 max-w-3xl text-title-sm font-medium tracking-tight md:text-title-md lg:text-title-lg">
          {shopCopy.heading}
        </h1>
        <p className="shopHeroCopy mt-6 max-w-xl text-body leading-8 text-paper/85">
          {shopCopy.body}
        </p>
        <div className="mt-8 w-full">
          <ShopSearch
            locale={locale}
            query={catalog.q}
            products={products}
            catalog={catalog}
          />
        </div>
      </div>
    </section>
  );
}
