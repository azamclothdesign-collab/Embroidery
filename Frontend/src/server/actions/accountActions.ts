"use server";

import {
  fetchAccountDownloads,
  fetchAccountSettings,
  updateAccountSettings,
} from "@/lib/api/accountApi";
import { ApiClientError } from "@/lib/api/apiClient";
import { changePassword } from "@/lib/api/authApi";
import {
  type AccountSettings,
  type DownloadLibraryItem,
} from "@/types/api/account";

export async function getAccountSettingsAction(): Promise<AccountSettings | null> {
  try {
    return await fetchAccountSettings();
  } catch {
    return null;
  }
}

export async function updateAccountSettingsAction(
  settings: AccountSettings,
): Promise<
  { ok: true; settings: AccountSettings } | { ok: false; error: string }
> {
  try {
    const next = await updateAccountSettings(settings);
    return { ok: true, settings: next };
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, error: error.code };
    }

    return { ok: false, error: "failed" };
  }
}

export async function changeAccountPasswordAction(input: {
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await changePassword(input);
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return { ok: false, error: "invalid" };
    }

    return { ok: false, error: "failed" };
  }
}

export async function getAccountDownloadsAction(): Promise<DownloadLibraryItem[]> {
  try {
    return await fetchAccountDownloads();
  } catch {
    return [];
  }
}
