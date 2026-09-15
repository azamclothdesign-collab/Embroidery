import { type Metadata } from "next";

import {
  adminCopy,
  adminHeroDefaults,
  adminHomeSections,
} from "@/constants/adminCopy";
import { AdminSiteHomePage } from "@/features/admin/site/AdminSiteHomePage";
import { fetchSiteHome } from "@/lib/api/siteSettingsApi";
import { type SiteHomeSettings } from "@/types/api/siteSettings";

type RouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: `${adminCopy.siteHomeTitle} | Admin`,
};

const defaultHome: SiteHomeSettings = {
  hero: {
    eyebrow: adminHeroDefaults.eyebrow,
    heading: adminHeroDefaults.heading,
    body: adminHeroDefaults.description,
    ctaLabel: adminHeroDefaults.primaryCta,
    ctaHref: adminHeroDefaults.primaryUrl,
  },
  sections: adminHomeSections.map((section) => ({
    id: section.id,
    label: section.label,
    enabled: true,
  })),
};

export default async function AdminSiteHomeRoute({ params }: RouteProps) {
  const { locale } = await params;

  let initialSettings: SiteHomeSettings;

  try {
    initialSettings = await fetchSiteHome();

    if (initialSettings.sections.length === 0) {
      initialSettings = {
        ...initialSettings,
        sections: defaultHome.sections,
        hero:
          initialSettings.hero.heading.trim().length > 0
            ? initialSettings.hero
            : defaultHome.hero,
      };
    }
  } catch {
    initialSettings = defaultHome;
  }

  return (
    <AdminSiteHomePage locale={locale} initialSettings={initialSettings} />
  );
}
