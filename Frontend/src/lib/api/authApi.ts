import { apiRoutes } from "@/constants/apiRoutes";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";
import {
  type AuthSessionResponse,
  type CustomerSessionView,
} from "@/types/api/auth";

import "server-only";

type CustomerSessionResponse = {
  session: CustomerSessionView | null;
};

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
}): Promise<AuthSessionResponse> {
  return requestApiJsonWithContext<AuthSessionResponse>({
    method: "POST",
    path: apiRoutes.auth.register,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });
}

export async function loginCustomer(input: {
  email: string;
  password: string;
}): Promise<AuthSessionResponse> {
  return requestApiJsonWithContext<AuthSessionResponse>({
    method: "POST",
    path: apiRoutes.auth.login,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });
}

export async function logoutCustomer(): Promise<{ ok: true }> {
  return requestApiJsonWithContext<{ ok: true }>({
    method: "POST",
    path: apiRoutes.auth.logout,
    body: {},
    cacheStrategy: { cache: "no-store" },
  });
}

export async function getCustomerSession(): Promise<CustomerSessionView | null> {
  const data = await requestApiJsonWithContext<CustomerSessionResponse>({
    method: "GET",
    path: apiRoutes.auth.session,
    cacheStrategy: { cache: "no-store" },
  });

  return data.session;
}

export async function forgotPassword(input: {
  email: string;
  password?: string | undefined;
  confirmPassword?: string | undefined;
}): Promise<{ ok: true }> {
  return requestApiJsonWithContext<{ ok: true }>({
    method: "POST",
    path: apiRoutes.auth.forgotPassword,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });
}

export async function changePassword(input: {
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
}): Promise<{ ok: true }> {
  return requestApiJsonWithContext<{ ok: true }>({
    method: "PUT",
    path: apiRoutes.auth.changePassword,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });
}
