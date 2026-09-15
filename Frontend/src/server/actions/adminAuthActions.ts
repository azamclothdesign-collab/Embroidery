"use server";

import {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "@/lib/api/adminAuthApi";
import { ApiClientError } from "@/lib/api/apiClient";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/server/session/cookies";
import { type AdminSessionView } from "@/types/api/auth";

export async function loginAdminAction(input: {
  email: string;
  password: string;
}): Promise<
  { ok: true; session: AdminSessionView } | { ok: false; error: string }
> {
  try {
    const result = await loginAdmin(input);
    await setAdminSessionCookie(result.sessionToken);
    return { ok: true, session: result.session };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return { ok: false, error: "invalid" };
    }

    return { ok: false, error: "failed" };
  }
}

export async function logoutAdminAction(): Promise<{ ok: true }> {
  try {
    await logoutAdmin();
  } catch {
    return { ok: true };
  }

  await clearAdminSessionCookie();
  return { ok: true };
}

export async function getAdminSessionAction(): Promise<AdminSessionView | null> {
  try {
    return await getAdminSession();
  } catch {
    return null;
  }
}
