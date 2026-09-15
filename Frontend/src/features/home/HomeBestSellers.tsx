import { type ShopProduct } from "@/constants/shopCatalog";
import { HomeBestSellerCard } from "@/features/home/HomeBestSellerCard";
import { HomeProductReveal } from "@/features/home/HomeProductReveal";

type HomeBestSellersProps = {
  locale: string;
  products: readonly ShopProduct[];
};

export function HomeBestSellers({ locale, products }: HomeBestSellersProps) {
  const bestSellers = products.slice(0, 8);
  return (
    <section
      id="best-sellers"
      className="scroll-mt-header-compact bg-surface px-6 py-16 md:py-24"
      aria-labelledby="best-sellers-heading"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-meta uppercase tracking-[0.22em] text-ink-soft">
          Customer favorites
        </p>
        <h2
          id="best-sellers-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
        >
          The Designs Everyone&apos;s Stitching
        </h2>
        <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
          Start with the designs loved by embroidery creators.
        </p>
        <HomeProductReveal>
          <ul className="mt-12 grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
            {bestSellers.map((product) => (
              <li key={product.slug}>
                <HomeBestSellerCard locale={locale} product={product} />
              </li>
            ))}
          </ul>
        </HomeProductReveal>
      </div>
    </section>
  );
}
