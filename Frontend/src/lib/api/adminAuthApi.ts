import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import {
  type AdminAuthSessionResponse,
  type AdminSessionView,
} from "@/types/api/auth";

import "server-only";

export async function loginAdmin(input: {
  email: string;
  password: string;
}): Promise<AdminAuthSessionResponse> {
  return requestApiJsonWithContext<AdminAuthSessionResponse>({
    method: "POST",
    path: apiRoutes.adminAuth.login,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });
}

export async function logoutAdmin(): Promise<{ ok: true }> {
  return requestApiJsonWithContext<{ ok: true }>({
    method: "POST",
    path: apiRoutes.adminAuth.logout,
    body: {},
    cacheStrategy: { cache: "no-store" },
  });
}

export async function getAdminSession(): Promise<AdminSessionView | null> {
  const data = await requestApiJsonWithContext<{
    session: AdminSessionView | null;
  }>({
    method: "GET",
    path: apiRoutes.adminAuth.session,
    cacheStrategy: { cache: "no-store" },
  });

  return data.session;
}
