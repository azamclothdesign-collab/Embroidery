import { z } from "zod";

import { authEmailSchema } from "./authSchema.js";
import { cartLineSchema } from "./cartSchema.js";

export const orderCreateBodySchema = z
  .object({
    email: authEmailSchema,
    totalCents: z.number().int().min(0),
    discountCents: z.number().int().min(0).default(0),
    lines: z.array(cartLineSchema).min(1),
    idempotencyKey: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

export const orderIdParamSchema = z.object({
  orderId: z.string().trim().min(1).max(40),
});
