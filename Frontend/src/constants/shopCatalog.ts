import { type ShopProduct } from "@/types/api/product";

export type { ShopProduct };

export const shopCategoryChips = [
  { id: "all", label: "All Designs" },
  { id: "wilcom-embroidery-software", label: "Wilcom Embroidery Software" },
  { id: "embroidery-digitizing-course", label: "Embroidery Digitizing Course" },
  { id: "step-by-step-embroidery-digitizing-guide", label: "Step-by-Step Embroidery Digitizing Guide in Urdu/Hindi" },
  { id: "cap-cart-embroidery", label: "Cap & Cart Embroidery Designs" },
  { id: "anarkali-kurti-shirt-embroidery", label: "Anarkali, Kurti & Shirt Embroidery Designs" },
  { id: "maxi-lehenga-embroidery", label: "Maxi & Lehenga Embroidery Designs" },
  { id: "sherwani-embroidery", label: "Sherwani Embroidery Designs" },
  { id: "shawl-embroidery", label: "Shawl Embroidery Designs" },
  { id: "neckline-embroidery", label: "Neckline Embroidery Designs" },
  { id: "gala-daman-embroidery", label: "Gala Daman Embroidery Designs" },
  { id: "gala-daman-sequins-embroidery", label: "Gala Daman Sequins Embroidery Designs" },
  { id: "all-over-embroidery", label: "All-Over Embroidery Designs" },
  { id: "motif-embroidery", label: "Motif Embroidery Designs" },
  { id: "velvet-embroidery", label: "Velvet Embroidery Designs" },
  { id: "cotton-embroidery", label: "Cotton Embroidery Designs" },
  { id: "shaneel-embroidery", label: "Shaneel Embroidery Designs" },
  { id: "aari-embroidery", label: "Aari Embroidery Designs" },
  { id: "dori-embroidery", label: "Dori Embroidery Designs" },
  { id: "fancy-lace-embroidery", label: "Fancy Lace Embroidery Designs" },
  { id: "sequins-embroidery", label: "Sequins Embroidery Designs" },
  { id: "logo-embroidery", label: "Logo Embroidery Designs" },
  { id: "4-head-embroidery", label: "4-Head Embroidery Designs" },
  { id: "2-head-3-head-embroidery", label: "2-Head & 3-Head Embroidery Designs" },
  { id: "4-border-shawl", label: "4-Border Shawl Designs" },
  { id: "islamic-embroidery", label: "Islamic Embroidery Designs" },
] as const;

export type ShopCategoryId = (typeof shopCategoryChips)[number]["id"];

export const shopFormatOptions = [
  "PES",
  "DST",
  "JEF",
  "EXP",
  "VP3",
  "HUS",
  "XXX",
] as const;

export const shopSizeOptions = [
  '2 × 2"',
  '4 × 4"',
  '5 × 7"',
  '6 × 10"',
  '8 × 12"',
] as const;

export const shopStitchFilters = [
  { id: "under-10k", label: "Under 10K", min: 0, max: 9999 },
  { id: "10k-20k", label: "10K–20K", min: 10000, max: 20000 },
  { id: "20k-40k", label: "20K–40K", min: 20000, max: 40000 },
  { id: "40k-plus", label: "40K+", min: 40000, max: Number.POSITIVE_INFINITY },
] as const;

export const shopDifficultyOptions = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const shopSortOptions = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "best-rated", label: "Best Rated" },
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
  { id: "most-downloaded", label: "Most Downloaded" },
] as const;

export type ShopSortId = (typeof shopSortOptions)[number]["id"];

export const shopKnownPdpSlug = "floral-butterfly-embroidery";
export const shopPageSize = 24;
export const shopPriceMaxCents = 2500;
export const machineCompatibilityHref = "/machine-compatibility";
export const shopRecentSearchesKey = "embroidery-shop-recent-searches";

export function formatShopPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

export function formatDesignCount(count: number): string {
  const formatted = new Intl.NumberFormat("en-US").format(count);
  return count === 1 ? `${formatted} Design` : `${formatted} Designs`;
}

export function isShopCategoryId(value: string): value is ShopCategoryId {
  return shopCategoryChips.some((chip) => chip.id === value);
}

export function isShopSortId(value: string): value is ShopSortId {
  return shopSortOptions.some((option) => option.id === value);
}

export function shopProductHref(locale: string, slug: string): string {
  return `/${locale}/designs/${slug}`;
}

export function productPackageLabel(_product: ShopProduct): string {
  return "ZIP package";
}

export function shopCategoryHref(locale: string, categoryId: string): string {
  return `/${locale}/designs/${categoryId}`;
}
