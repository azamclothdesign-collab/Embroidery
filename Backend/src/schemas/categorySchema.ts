import { z } from "zod";

export const categoryBodySchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    label: z.string().trim().min(1).max(200),
    sortOrder: z.number().int().min(0).default(0),
    isVisible: z.boolean().default(true),
    imageSrc: z.string().trim().min(1).max(500).optional(),
    imageAlt: z.string().trim().min(1).max(300).optional(),
  })
  .strip();

export const categoryIdParamSchema = z.object({
  id: z.string().trim().min(1).max(120),
});
