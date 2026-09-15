"use client";

import dynamic from "next/dynamic";

import { featuredCollectionCopy } from "@/constants/featuredCollection";
import { type ShopProduct } from "@/constants/shopCatalog";

const HomeCollectionTrack = dynamic(
  () =>
    import("@/features/home/HomeCollectionTrack").then(
      (module) => module.HomeCollectionTrack,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mt-10 h-64 w-full rounded-sm bg-line/30" aria-hidden="true" />
    ),
  },
);

type HomeFeaturedCollectionProps = {
  locale: string;
  products: readonly ShopProduct[];
};

export function HomeFeaturedCollection({
  locale,
  products,
}: HomeFeaturedCollectionProps) {
  return (
    <section className="bg-paper" aria-labelledby="featured-collection-heading">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <h2
          id="featured-collection-heading"
          className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
        >
          {featuredCollectionCopy.heading}
        </h2>
        <HomeCollectionTrack locale={locale} products={products} />
      </div>
    </section>
  );
}
