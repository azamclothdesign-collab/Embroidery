import { z } from "zod";

export const wishlistUpdateBodySchema = z
  .object({
    slugs: z.array(z.string().trim().min(1).max(120)),
  })
  .strict();
