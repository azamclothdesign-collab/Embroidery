import { z } from "zod";

export const accountSettingsBodySchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    displayName: z.string().trim().max(120),
    country: z.string().trim().max(120),
    preferredFormat: z.enum(["PES", "DST", "JEF", "all"]),
    rememberFormat: z.boolean(),
    openDownloadInstructions: z.boolean(),
  })
  .strict();

export const customerIdParamSchema = z.object({
  id: z.string().trim().min(1).max(120),
});
