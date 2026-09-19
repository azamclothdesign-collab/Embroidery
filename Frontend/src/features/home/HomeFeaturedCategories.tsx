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
        <h2
          id="featured-categories-heading"
          className="text-center text-title-sm font-medium tracking-tight text-ink uppercase md:text-title-lg"
        >
          ALL EMBROIDERY DESIGN
        </h2>
        <HomeCategoryGrid locale={locale} tiles={tiles} />
      </div>
    </section>
  );
}
