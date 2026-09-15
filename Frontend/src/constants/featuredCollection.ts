import { type ShopProduct } from "@/types/api/product";

export const featuredCollectionCopy = {
  heading: "Made for Every Kind of Project.",
} as const;

export const featuredCollectionTabs = [
  { id: "all", label: "All" },
  { id: "apparel", label: "Apparel" },
  { id: "home", label: "Home" },
  { id: "gifts", label: "Gifts" },
  { id: "baby", label: "Baby" },
  { id: "seasonal", label: "Seasonal" },
  { id: "monograms", label: "Monograms" },
] as const;

export type FeaturedCollectionTabId =
  (typeof featuredCollectionTabs)[number]["id"];

type FeaturedCollectionEntry = {
  slug: string;
  tabs: readonly Exclude<FeaturedCollectionTabId, "all">[];
};

export const featuredCollectionEntries: readonly FeaturedCollectionEntry[] = [
  { slug: "design-one", tabs: ["home"] },
  { slug: "design-two", tabs: ["home"] },
  { slug: "design-three", tabs: ["gifts"] },
  { slug: "design-four", tabs: ["gifts"] },
  { slug: "design-five", tabs: ["baby", "apparel"] },
  { slug: "design-six", tabs: ["baby"] },
  { slug: "design-seven", tabs: ["seasonal"] },
  { slug: "design-eight", tabs: ["seasonal", "home"] },
  { slug: "design-nine", tabs: ["seasonal"] },
  { slug: "design-ten", tabs: ["monograms"] },
  { slug: "design-eleven", tabs: ["monograms", "apparel"] },
  { slug: "butter-radiance", tabs: ["monograms", "gifts"] },
  { slug: "iznik-maxi-frock", tabs: ["apparel", "gifts"] },
  { slug: "sapphire-sun-azure", tabs: ["apparel"] },
  { slug: "whats-app-image", tabs: ["home", "monograms"] },
  { slug: "bd2506b", tabs: ["seasonal", "gifts"] },
  { slug: "images-two", tabs: ["home"] },
  { slug: "stardom-elaf-lime", tabs: ["apparel"] },
  { slug: "stardom-elaf-glamorous", tabs: ["apparel", "gifts"] },
];

export function productsForCollectionTab(
  tabId: FeaturedCollectionTabId,
  catalog: readonly ShopProduct[],
): ShopProduct[] {
  return featuredCollectionEntries.flatMap((entry) => {
    const belongs =
      tabId === "all"
        ? true
        : entry.tabs.some((assignedTab) => assignedTab === tabId);

    if (!belongs) {
      return [];
    }

    const product = catalog.find((item) => item.slug === entry.slug);

    return product === undefined ? [] : [product];
  });
}
