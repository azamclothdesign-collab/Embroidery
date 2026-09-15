import { categoryHubTiles } from "@/constants/categoriesHubCopy";
import { type CategoryRecord } from "@/types/api/product";

export type CategoryStorefrontTile = {
  id: string;
  label: string;
  imageSrc: string | null;
  imageAlt: string | null;
};

export function buildCategoryStorefrontTiles(
  categories: readonly CategoryRecord[],
): CategoryStorefrontTile[] {
  const visible = categories.filter((category) => category.isVisible);

  if (visible.length === 0) {
    return categoryHubTiles.map((tile) => ({
      id: tile.id,
      label: tile.label,
      imageSrc: tile.imageSrc,
      imageAlt: tile.imageAlt,
    }));
  }

  return visible.map((category) => {
    const fallback = categoryHubTiles.find((tile) => tile.id === category.id);
    const imageSrc =
      category.imageSrc !== undefined && category.imageSrc.length > 0
        ? category.imageSrc
        : (fallback?.imageSrc ?? null);
    const imageAlt =
      category.imageAlt !== undefined && category.imageAlt.length > 0
        ? category.imageAlt
        : (fallback?.imageAlt ?? `${category.label} designs`);

    return {
      id: category.id,
      label: category.label,
      imageSrc,
      imageAlt,
    };
  });
}
