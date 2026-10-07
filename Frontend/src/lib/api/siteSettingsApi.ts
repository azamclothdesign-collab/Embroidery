import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import {
  type SiteFaqsSettings,
  type SiteGlobalSettings,
  type SiteHomeSettings,
  type SitePagesSettings,
  type SitePaymentsSettings,
} from "@/types/api/siteSettings";

import "server-only";

type GlobalResponse = { settings: SiteGlobalSettings };
type HomeResponse = { settings: SiteHomeSettings };
type FaqsResponse = { settings: SiteFaqsSettings };
type PagesResponse = { settings: SitePagesSettings };
type PaymentsResponse = { settings: SitePaymentsSettings };

export async function fetchSiteGlobal(): Promise<SiteGlobalSettings> {
  const data = await requestApiJsonWithContext<GlobalResponse>({
    method: "GET",
    path: apiRoutes.adminSite.global,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function updateSiteGlobal(
  settings: SiteGlobalSettings,
): Promise<SiteGlobalSettings> {
  const data = await requestApiJsonWithContext<GlobalResponse>({
    method: "PUT",
    path: apiRoutes.adminSite.global,
    body: settings,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function fetchSiteHome(): Promise<SiteHomeSettings> {
  const data = await requestApiJsonWithContext<HomeResponse>({
    method: "GET",
    path: apiRoutes.adminSite.home,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function updateSiteHome(
  settings: SiteHomeSettings,
): Promise<SiteHomeSettings> {
  const data = await requestApiJsonWithContext<HomeResponse>({
    method: "PUT",
    path: apiRoutes.adminSite.home,
    body: settings,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function fetchSiteFaqs(): Promise<SiteFaqsSettings> {
  const data = await requestApiJsonWithContext<FaqsResponse>({
    method: "GET",
    path: apiRoutes.adminSite.faqs,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function updateSiteFaqs(
  settings: SiteFaqsSettings,
): Promise<SiteFaqsSettings> {
  const data = await requestApiJsonWithContext<FaqsResponse>({
    method: "PUT",
    path: apiRoutes.adminSite.faqs,
    body: settings,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function fetchSitePages(): Promise<SitePagesSettings> {
  const data = await requestApiJsonWithContext<PagesResponse>({
    method: "GET",
    path: apiRoutes.adminSite.pages,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function updateSitePages(
  settings: SitePagesSettings,
): Promise<SitePagesSettings> {
  const data = await requestApiJsonWithContext<PagesResponse>({
    method: "PUT",
    path: apiRoutes.adminSite.pages,
    body: settings,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function fetchSitePayments(): Promise<SitePaymentsSettings> {
  const data = await requestApiJsonWithContext<PaymentsResponse>({
    method: "GET",
    path: apiRoutes.adminSite.payments,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function updateSitePayments(
  settings: SitePaymentsSettings,
): Promise<SitePaymentsSettings> {
  const data = await requestApiJsonWithContext<PaymentsResponse>({
    method: "PUT",
    path: apiRoutes.adminSite.payments,
    body: settings,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}
