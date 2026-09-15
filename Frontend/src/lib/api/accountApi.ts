import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import {
  type AccountSettings,
  type DownloadLibraryItem,
} from "@/types/api/account";

import "server-only";

type AccountSettingsResponse = {
  settings: AccountSettings;
};

type AccountDownloadsResponse = {
  items: DownloadLibraryItem[];
};

export async function fetchAccountSettings(): Promise<AccountSettings> {
  const data = await requestApiJsonWithContext<AccountSettingsResponse>({
    method: "GET",
    path: apiRoutes.account.settings,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function updateAccountSettings(
  settings: AccountSettings,
): Promise<AccountSettings> {
  const data = await requestApiJsonWithContext<AccountSettingsResponse>({
    method: "PUT",
    path: apiRoutes.account.settings,
    body: settings,
    cacheStrategy: { cache: "no-store" },
  });

  return data.settings;
}

export async function fetchAccountDownloads(): Promise<DownloadLibraryItem[]> {
  const data = await requestApiJsonWithContext<AccountDownloadsResponse>({
    method: "GET",
    path: apiRoutes.account.downloads,
    cacheStrategy: { cache: "no-store" },
  });

  return data.items;
}
