import { z } from "zod";

export const cartLineSchema = z
  .object({
    slug: z.string().trim().min(1).max(120),
    pdpSlug: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(200),
    priceCents: z.number().int().min(0),
    imageSrc: z.string().trim().min(1).max(500),
    imageAlt: z.string().trim().min(1).max(300),
  })
  .strict();

export const cartUpdateBodySchema = z
  .object({
    lines: z.array(cartLineSchema),
  })
  .strict();
