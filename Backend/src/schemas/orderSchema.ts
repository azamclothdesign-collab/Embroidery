import { z } from "zod";

import { authEmailSchema } from "./authSchema.js";
import { cartLineSchema } from "./cartSchema.js";

export const orderCreateBodySchema = z
  .object({
    email: authEmailSchema,
    contactName: z.string().trim().min(1).max(120),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(30)
      .regex(/^[+]?[\d\s().-]{7,30}$/, "Invalid phone number"),
    totalCents: z.number().int().min(0),
    discountCents: z.number().int().min(0).default(0),
    lines: z.array(cartLineSchema).min(1),
    idempotencyKey: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

export const orderIdParamSchema = z.object({
  orderId: z.string().trim().min(1).max(40),
});
