"use server";

import {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "@/lib/api/adminAuthApi";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/server/session/cookies";
import { type AdminSessionView } from "@/types/api/auth";

function isUnauthorized(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const record = error as { status?: unknown; code?: unknown };
  return record.status === 401 || record.code === "unauthenticated";
}

export async function loginAdminAction(input: {
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const result = await loginAdmin({
      email: input.email,
      password: input.password,
    });

    if (typeof result.sessionToken !== "string" || result.sessionToken.length === 0) {
      return { ok: false, error: "failed" };
    }

    await setAdminSessionCookie(result.sessionToken);
    return { ok: true };
  } catch (error) {
    if (isUnauthorized(error)) {
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
