import "server-only";
import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api.server";
import { getAdminToken } from "@/lib/session.server";

type Options = Parameters<typeof api>[1];

/**
 * Backend call with the admin session from the httpOnly cookie.
 * Expired session → login page; bootstrap password still set → account page.
 */
export async function adminApi<T>(path: string, options: Omit<NonNullable<Options>, "adminSession"> = {}): Promise<T> {
  const token = await getAdminToken();
  if (token === null) redirect("/admin/login");
  try {
    return await api<T>(path, { ...options, adminSession: token });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/admin/login?expired=1");
      if (error.problem.code === "password_change_required") redirect("/admin/account?force=1");
    }
    throw error;
  }
}

export type AdminMe = { id: string; email: string; mustChangePassword: boolean };
