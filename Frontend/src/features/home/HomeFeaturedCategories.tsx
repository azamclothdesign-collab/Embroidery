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
    <section className="bg-paper px-6 py-16 md:py-24" aria-labelledby="featured-categories-heading">
      <div className="mx-auto max-w-7xl">
        <p className="text-meta uppercase tracking-[0.22em] text-ink-soft">
          Explore the collection
        </p>
        <h2
          id="featured-categories-heading"
          className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-lg"
        >
          Find Something Worth Stitching.
        </h2>
        <p className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
          Explore thoughtfully digitized designs organized around the projects,
          occasions, and ideas you love.
        </p>
        <HomeCategoryGrid locale={locale} tiles={tiles} />
      </div>
    </section>
  );
}
