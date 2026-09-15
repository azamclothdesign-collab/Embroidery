import { z } from "zod";

export const mediaUploadBodySchema = z
  .object({
    fileName: z.string().trim().min(1).max(200),
    contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    contentBase64: z.string().min(1).max(8_000_000),
  })
  .strict();

export const mediaPackageUploadBodySchema = z
  .object({
    fileName: z.string().trim().min(1).max(260),
    contentType: z.literal("application/zip"),
    contentBase64: z.string().min(1).max(28_000_000),
  })
  .strict();

export const orderPackageDownloadBodySchema = z
  .object({
    orderId: z.string().trim().min(1).max(80),
    productSlug: z.string().trim().min(1).max(120),
  })
  .strict();
