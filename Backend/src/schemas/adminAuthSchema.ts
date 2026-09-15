import { z } from "zod";

import { authEmailSchema } from "./authSchema.js";

export const adminLoginBodySchema = z
  .object({
    email: authEmailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();
