import { categoryHubTiles } from "@/constants/categoriesHubCopy";

export const featuredCategories = categoryHubTiles.map((tile) => ({
  name: tile.label,
  query: tile.id,
  imageSrc: tile.imageSrc ?? "/assets/categoryPlaceholder.webp",
  imageAlt: tile.imageAlt ?? `Embroidery design for ${tile.label}`,
  placement: tile.id,
}));

export type FeaturedCategoryPlacement =
  (typeof featuredCategories)[number]["placement"];
