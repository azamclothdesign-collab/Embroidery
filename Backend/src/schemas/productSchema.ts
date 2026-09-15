import { z } from "zod";

const shopFormatOptions = [
  "PES",
  "DST",
  "JEF",
  "EXP",
  "VP3",
  "HUS",
  "XXX",
] as const;

export const productBodySchema = z
  .object({
    slug: z.string().trim().min(1).max(120),
    pdpSlug: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(200),
    categoryId: z.string().trim().min(1).max(120),
    rating: z.number().min(0).max(5),
    formats: z.array(z.enum(shopFormatOptions)).default([]),
    priceCents: z.number().int().min(0),
    hoopSize: z.string().trim().min(1).max(40),
    stitchCount: z.number().int().min(0),
    badge: z.string().trim().max(80),
    imageSrc: z.string().trim().min(1).max(500),
    imageAlt: z.string().trim().min(1).max(300),
    stitchedImageSrc: z.string().trim().max(500).optional(),
    stitchedImageAlt: z.string().trim().max(300).optional(),
    description: z.string().trim().max(8000).optional(),
    packagePath: z.string().trim().min(1).max(500).optional(),
    packageFileName: z.string().trim().min(1).max(260).optional(),
    isVisible: z.boolean().default(true),
  })
  .strip();

export const productSlugParamSchema = z.object({
  slug: z.string().trim().min(1).max(120),
});
