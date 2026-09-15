import { z } from "zod";

const contactTopicIds = [
  "file-format",
  "machine-compatibility",
  "download-issue",
  "order-question",
  "payment-question",
  "embroidery-guide",
  "licensing",
  "technical-issue",
  "other",
] as const;

export const contactCreateBodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    topic: z.enum(contactTopicIds),
    orderNumber: z.string().trim().max(40).optional(),
    message: z.string().trim().min(1).max(4000),
  })
  .strict();
