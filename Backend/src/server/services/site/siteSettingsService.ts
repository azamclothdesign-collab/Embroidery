import {
  readSiteSettings,
  writeSiteSettings,
} from "../../database/repositories/site/siteSettingsRepository.js";
import {
  type SiteFaqsSettings,
  type SiteGlobalSettings,
  type SiteHomeSettings,
  type SitePagesSettings,
  type SiteSettingsKey,
} from "../../../types/siteSettings.js";
import { businessContact } from "../../../constants/businessContact.js";
import { ServiceError } from "../../../utils/serviceError.js";

const defaultGlobalSettings: SiteGlobalSettings = {
  brandName: "Embroidery",
  tagline: "Beautiful embroidery designs, ready for your next creation.",
  contactEmail: businessContact.email,
  contactPhone: businessContact.phone,
  contactAddress: "",
  instagram: "",
  pinterest: "",
};

const defaultHomeSettings: SiteHomeSettings = {
  hero: {
    eyebrow: "Digital embroidery designs",
    heading: "Designs Made to Be Stitched.",
    body: "Professionally digitized embroidery designs — one confidential ZIP per design, ready to download and stitch.",
    ctaLabel: "Explore Designs",
    ctaHref: "/designs",
  },
  sections: [
    { id: "hero", label: "Hero", enabled: true },
    { id: "categories", label: "Categories", enabled: true },
    { id: "social-proof", label: "Social proof", enabled: true },
    { id: "problem-solution", label: "Problem / Solution", enabled: true },
    { id: "how-it-works", label: "How it works", enabled: true },
    { id: "featured-designs", label: "Featured designs", enabled: true },
    { id: "testimonials", label: "Testimonials", enabled: true },
    { id: "faq", label: "FAQ", enabled: true },
    { id: "final-cta", label: "Final CTA", enabled: true },
  ],
};

const defaultFaqsSettings: SiteFaqsSettings = {
  items: [],
};

const defaultPagesSettings: SitePagesSettings = {
  pages: [
    { id: "about", label: "About", href: "/about", visible: true },
    {
      id: "how-it-works",
      label: "How It Works",
      href: "/how-it-works",
      visible: true,
    },
    { id: "contact", label: "Contact", href: "/contact", visible: true },
    {
      id: "licensing",
      label: "Licensing",
      href: "/licensing",
      visible: true,
    },
    {
      id: "help-center",
      label: "Help Center",
      href: "/help-center",
      visible: true,
    },
  ],
};

function requireAdmin(adminUserId?: string): string {
  if (adminUserId === undefined) {
    throw new ServiceError(403, "forbidden", "Forbidden");
  }

  return adminUserId;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function normalizeGlobal(value: unknown): SiteGlobalSettings {
  const record = asRecord(value);

  return {
    brandName: readString(record, "brandName") || defaultGlobalSettings.brandName,
    tagline: readString(record, "tagline"),
    contactEmail:
      readString(record, "contactEmail") || defaultGlobalSettings.contactEmail,
    contactPhone:
      readString(record, "contactPhone") || defaultGlobalSettings.contactPhone,
    contactAddress: readString(record, "contactAddress"),
    instagram: readString(record, "instagram"),
    pinterest: readString(record, "pinterest"),
  };
}

function normalizeHome(value: unknown): SiteHomeSettings {
  const record = asRecord(value);
  const heroRecord = asRecord(record.hero);
  const sectionsRaw = record.sections;
  const sections = Array.isArray(sectionsRaw)
    ? sectionsRaw
        .map((item) => {
          const section = asRecord(item);
          const id = readString(section, "id");
          const label = readString(section, "label");

          if (id.length === 0 || label.length === 0) {
            return null;
          }

          return {
            id,
            label,
            enabled: section.enabled !== false,
          };
        })
        .filter((item): item is { id: string; label: string; enabled: boolean } => {
          return item !== null;
        })
    : [];

  const heroHeading = readString(heroRecord, "heading");

  return {
    hero: {
      eyebrow:
        readString(heroRecord, "eyebrow") || defaultHomeSettings.hero.eyebrow,
      heading: heroHeading || defaultHomeSettings.hero.heading,
      body: readString(heroRecord, "body") || defaultHomeSettings.hero.body,
      ctaLabel:
        readString(heroRecord, "ctaLabel") || defaultHomeSettings.hero.ctaLabel,
      ctaHref:
        readString(heroRecord, "ctaHref") || defaultHomeSettings.hero.ctaHref,
    },
    sections: sections.length > 0 ? sections : defaultHomeSettings.sections,
  };
}

export async function getSiteSettings<TValue>(
  key: SiteSettingsKey,
): Promise<TValue> {
  const value = await readSiteSettings<unknown>(key);

  if (key === "global") {
    return normalizeGlobal(value ?? defaultGlobalSettings) as TValue;
  }

  if (key === "home") {
    return normalizeHome(value ?? defaultHomeSettings) as TValue;
  }

  if (value === null) {
    if (key === "pages") {
      return defaultPagesSettings as TValue;
    }

    return defaultFaqsSettings as TValue;
  }

  return value as TValue;
}

export async function putSiteSettings<TValue>(input: {
  adminUserId?: string | undefined;
  key: SiteSettingsKey;
  value: TValue;
}): Promise<TValue> {
  requireAdmin(input.adminUserId);

  if (input.key === "global") {
    const normalized = normalizeGlobal(input.value);
    return (await writeSiteSettings(input.key, normalized)) as TValue;
  }

  if (input.key === "home") {
    const normalized = normalizeHome(input.value);
    return (await writeSiteSettings(input.key, normalized)) as TValue;
  }

  return writeSiteSettings(input.key, input.value);
}
