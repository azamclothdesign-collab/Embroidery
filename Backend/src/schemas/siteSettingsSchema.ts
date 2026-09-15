import { z } from "zod";

export const siteGlobalSettingsSchema = z
  .object({
    brandName: z.string().trim().max(200),
    tagline: z.string().trim().max(400),
    contactEmail: z.string().trim().max(200),
    contactPhone: z.string().trim().max(80),
    contactAddress: z.string().trim().max(400),
    instagram: z.string().trim().max(300),
    pinterest: z.string().trim().max(300),
  })
  .strip();

export const siteHomeSectionSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(200),
    enabled: z.boolean(),
  })
  .strip();

export const siteHomeSettingsSchema = z
  .object({
    hero: z
      .object({
        eyebrow: z.string().trim().max(200),
        heading: z.string().trim().max(400),
        body: z.string().trim().max(2000),
        ctaLabel: z.string().trim().max(120),
        ctaHref: z.string().trim().max(300),
      })
      .strip(),
    sections: z.array(siteHomeSectionSchema),
  })
  .strip();

export const siteFaqItemSchema = z
  .object({
    question: z.string().trim().min(1).max(400),
    answer: z.string().trim().min(1).max(4000),
    visible: z.boolean(),
  })
  .strip();

export const siteFaqsSettingsSchema = z
  .object({
    items: z.array(siteFaqItemSchema),
  })
  .strip();

export const sitePageItemSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(200),
    href: z.string().trim().min(1).max(300),
    visible: z.boolean(),
  })
  .strip();

export const sitePagesSettingsSchema = z
  .object({
    pages: z.array(sitePageItemSchema),
  })
  .strip();
