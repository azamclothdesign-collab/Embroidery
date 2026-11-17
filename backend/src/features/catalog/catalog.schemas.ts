import { z } from "zod";

export const slugRule = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

const text = (max: number) => z.string().trim().max(max);
const mediaPath = z.string().regex(/^\/media\/[a-f0-9-]{36}$/, "Invalid image");

export const FORMATS = ["DST", "PES", "JEF", "EXP", "VP3", "XXX", "HUS", "VIP", "SEW", "EMB"] as const;

export const categoryInput = z.object({
  slug: slugRule,
  nameEn: text(120).min(1, "Required"),
  nameUr: text(120),
  introEn: text(600),
  introUr: text(600),
  seoTitleEn: text(70),
  seoTitleUr: text(70),
  seoDescriptionEn: text(170),
  seoDescriptionUr: text(170),
  image: mediaPath.nullable(),
  sortOrder: z.number().int().min(-9999).max(9999),
  isVisible: z.boolean(),
});
export type CategoryInput = z.infer<typeof categoryInput>;

export const productInput = z
  .object({
    slug: slugRule,
    categoryId: z.uuid(),
    nameEn: text(160).min(1, "Required"),
    nameUr: text(160),
    descriptionEn: text(5000),
    descriptionUr: text(5000),
    priceMinor: z.number().int().min(0).max(100_000_000),
    salePriceMinor: z.number().int().min(0).max(100_000_000).nullable(),
    formats: z.array(z.enum(FORMATS)).max(FORMATS.length),
    hoopSize: text(40),
    stitchCount: z.number().int().min(0).max(10_000_000),
    images: z.array(mediaPath).max(8),
    status: z.enum(["draft", "published", "archived"]),
    isFeatured: z.boolean(),
    seoTitleEn: text(70),
    seoTitleUr: text(70),
    seoDescriptionEn: text(170),
    seoDescriptionUr: text(170),
    packageId: z.string().regex(/^[a-f0-9-]{36}$/).nullable(),
  })
  .refine((value) => value.salePriceMinor === null || value.salePriceMinor < value.priceMinor, {
    message: "Sale price must be lower than the price",
    path: ["salePriceMinor"],
  });
export type ProductInput = z.infer<typeof productInput>;

export const listQuery = z.object({
  category: slugRule.optional(),
  q: z.string().trim().max(80).optional(),
  format: z.enum(FORMATS).optional(),
  onSale: z.enum(["1"]).optional(),
  featured: z.enum(["1"]).optional(),
  sort: z.enum(["new", "price_asc", "price_desc", "name"]).default("new"),
  page: z.coerce.number().int().min(1).max(200).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});
export type ListQuery = z.infer<typeof listQuery>;
