import { fromScreenToStitchPosterSrc } from "@/constants/assetPaths";
import { featuredCategories } from "@/constants/featuredCategories";
import {
  shopCategoryChips,
  type ShopCategoryId,
} from "@/constants/shopCatalog";

export type CategoryLandingId = Exclude<ShopCategoryId, "all">;

export type CategoryPageContent = {
  id: CategoryLandingId;
  label: string;
  heading: string;
  body: string;
  introHeading: string;
  introBody: string;
  collectionHeading: string;
  seoHeading: string;
  seoParagraphs: readonly string[];
  projectCards: readonly {
    title: string;
    body: string;
  }[];
  heroImageSrc: string;
  heroImageAlt: string;
};

const featuredImageByQuery = Object.fromEntries(
  featuredCategories.map((item) => [item.query, item]),
) as Record<
  string,
  (typeof featuredCategories)[number] | undefined
>;

function baseContent(
  id: CategoryLandingId,
  label: string,
  extras: Partial<CategoryPageContent> &
    Pick<CategoryPageContent, "heading" | "body" | "seoParagraphs">,
): CategoryPageContent {
  const featured = featuredImageByQuery[id];

  return {
    id,
    label,
    heading: extras.heading,
    body: extras.body,
    introHeading: extras.introHeading ?? "Designed to Make an Impression.",
    introBody:
      extras.introBody ??
      "Explore carefully selected embroidery designs created for everything from personal projects to finished pieces you'll want to keep.",
    collectionHeading: extras.collectionHeading ?? `Explore All ${label} Designs`,
    seoHeading: extras.seoHeading ?? `${label} Embroidery Designs`,
    seoParagraphs: extras.seoParagraphs,
    projectCards: extras.projectCards ?? [
      {
        title: "Clothing",
        body: "Add thoughtful embroidery details to garments and accessories.",
      },
      {
        title: "Home",
        body: "Bring embroidery into linens, décor, and handmade pieces.",
      },
      {
        title: "Gifts",
        body: "Create personalized pieces with a handmade touch.",
      },
    ],
    heroImageSrc: featured?.imageSrc ?? fromScreenToStitchPosterSrc,
    heroImageAlt:
      featured?.imageAlt ?? "Close-up of embroidery thread stitched into cream linen",
  };
}

export const categoryPageCopy = {
  eyebrow: "Embroidery Collection",
  exploreDesigns: "Explore Designs",
  findMachine: "Find Your Machine",
  collectionEyebrow: "The Collection",
  highlights: [
    {
      title: "Detailed",
      body: "Carefully constructed embroidery designs with attention to stitch detail.",
    },
    {
      title: "Digital",
      body: "Downloadable designs made for compatible embroidery workflows.",
    },
    {
      title: "Versatile",
      body: "Explore designs across different projects, styles, and applications.",
    },
  ] as const,
  editorsEyebrow: "Editor's Picks",
  editorsHeading: "A Few Favorites From the Collection",
  favoritesHeading: "What Customers Are Choosing",
  favoriteLabel: "Customer favorite",
  projectsHeadingPrefix: "Designs for Every Kind of Project",
  machineHeading: "Not Sure Which File Format You Need?",
  machineBody:
    "Find your machine and discover the format that's right for your workflow.",
  beginnerHeading: "New to Embroidery?",
  beginnerBody:
    "Before choosing a design, review size, stitch count, and what's included in the ZIP package.",
  relatedEyebrow: "Keep Exploring",
  relatedHeading: "You Might Also Like",
  explore: "Explore",
  finalEyebrow: "Find Your Next Design",
  finalHeading: "Something Worth Stitching Is Waiting.",
  finalBody:
    "Explore more digital embroidery designs and find the one that fits your next project.",
  browseAll: "Browse All Designs",
  emptyCategoryHeading: "No Designs in This Collection Yet",
  emptyCategoryBody:
    "This category is ready for future designs. Explore the full shop while the collection grows.",
  emptyFilterHeading: "No Designs Match Those Filters",
  emptyFilterBody:
    "Try removing a filter or exploring the complete collection.",
  clearFilters: "Clear Filters",
  browseCategory: "Browse This Collection",
} as const;

const categoryContentById = Object.fromEntries(
  shopCategoryChips
    .filter((chip) => chip.id !== "all")
    .map((chip) => [
      chip.id,
      baseContent(chip.id as CategoryLandingId, chip.label, {
        heading: `${chip.label}`,
        body: `Explore our premium collection of ${chip.label.toLowerCase()} for your next creative project.`,
        seoParagraphs: [
          `Browse the latest ${chip.label.toLowerCase()} ready for digital download. Each product page lists ZIP package delivery and design specifications.`,
          `If you are unsure which file format you need, check our Machine Compatibility guide before purchasing to ensure smooth stitching.`,
        ],
      }),
    ])
) as Record<CategoryLandingId, CategoryPageContent>;

export function isCategoryLandingId(value: string): value is CategoryLandingId {
  return value !== "all" && shopCategoryChips.some((chip) => chip.id === value);
}

export function getCategoryPageContent(id: string): CategoryPageContent {
  if (isCategoryLandingId(id)) {
    return categoryContentById[id];
  }

  const label = id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return baseContent(id as CategoryLandingId, label, {
    heading: label,
    body: `Explore our premium collection of ${label.toLowerCase()} for your next creative project.`,
    seoParagraphs: [
      `Browse the latest ${label.toLowerCase()} ready for digital download. Each product page lists ZIP package delivery and design specifications.`,
      `If you are unsure which file format you need, check our Machine Compatibility guide before purchasing to ensure smooth stitching.`,
    ],
  });
}

export function relatedCategoryIds(currentId: string): CategoryLandingId[] {
  return shopCategoryChips
    .map((chip) => chip.id)
    .filter(
      (id): id is CategoryLandingId => id !== "all" && id !== currentId,
    )
    .slice(0, 4);
}
