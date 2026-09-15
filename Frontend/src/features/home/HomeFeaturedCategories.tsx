import { HomeCategoryGrid } from "@/features/home/HomeCategoryGrid";
import { type CategoryStorefrontTile } from "@/lib/catalog/buildCategoryStorefrontTiles";

type HomeFeaturedCategoriesProps = {
  locale: string;
  tiles: readonly CategoryStorefrontTile[];
};

export function HomeFeaturedCategories({
  locale,
  tiles,
}: HomeFeaturedCategoriesProps) {
  return (
    <section className="bg-paper px-6 pt-10 pb-16 md:pt-12 md:pb-20" aria-labelledby="featured-categories-heading">
      <div className="mx-auto max-w-7xl">
        <p className="text-meta uppercase tracking-[0.22em] text-ink-soft">
          Explore the collection
        </p>
        <h2
          id="featured-categories-heading"
          className="mt-3 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
        >
          Find Something Worth Stitching.
        </h2>
        <p className="mt-3 max-w-2xl text-body leading-7 text-ink-soft md:mt-4">
          Explore thoughtfully digitized designs organized around the projects,
          occasions, and ideas you love.
        </p>
        <HomeCategoryGrid locale={locale} tiles={tiles} />
      </div>
    </section>
  );
}
