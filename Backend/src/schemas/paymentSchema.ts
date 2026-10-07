import { z } from "zod";

export const payfastInitBodySchema = z
  .object({
    orderId: z.string().trim().min(1).max(40),
    locale: z.string().trim().min(2).max(10).optional(),
  })
  .strict();

export const payfastConfirmBodySchema = z
  .object({
    orderId: z.string().trim().min(1).max(40),
    signature: z.string().trim().max(128).optional(),
    paymentReference: z.string().trim().max(120).optional(),
    markFailed: z.boolean().optional(),
  })
  .strict();
