"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api.server";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/session.server";
import type { ActionError } from "./store";

export type FormResult = { ok: true; message?: string } | ActionError | null;

function fail(error: unknown): ActionError {
  if (error instanceof ApiError) {
    return {
      ok: false,
      code: error.problem.code,
      message: error.problem.title,
      ...(error.problem.fields === undefined ? {} : { fields: error.problem.fields }),
    };
  }
  console.error(error);
  return { ok: false, code: "unexpected", message: "Something went wrong. Please try again." };
}

export async function loginAction(_: FormResult, formData: FormData): Promise<FormResult> {
  let mustChange = false;
  try {
    const result = await api<{ token: string; expiresAt: string; mustChangePassword: boolean }>("/v1/admin/auth/login", {
      method: "POST",
      body: { email: String(formData.get("email") ?? "").trim(), password: String(formData.get("password") ?? "") },
    });
    await setAdminToken(result.token, result.expiresAt);
    mustChange = result.mustChangePassword;
  } catch (error) {
    return fail(error);
  }
  redirect(mustChange ? "/admin/account?force=1" : "/admin");
}

export async function logoutAction(): Promise<void> {
  const token = await getAdminToken();
  if (token !== null) {
    await api("/v1/admin/auth/logout", { method: "POST", adminSession: token }).catch(() => undefined);
  }
  await clearAdminToken();
  redirect("/admin/login");
}

export async function forgotAction(_: FormResult, formData: FormData): Promise<FormResult> {
  try {
    await api("/v1/admin/auth/forgot", { method: "POST", body: { email: String(formData.get("email") ?? "").trim() } });
    return { ok: true, message: "If that email belongs to an admin, a reset link is on its way. It expires in 30 minutes." };
  } catch (error) {
    return fail(error);
  }
}

export async function resetAction(_: FormResult, formData: FormData): Promise<FormResult> {
  const password = String(formData.get("password") ?? "");
  if (password !== String(formData.get("confirm") ?? "")) {
    return { ok: false, code: "mismatch", message: "Passwords do not match", fields: { confirm: "Passwords do not match" } };
  }
  try {
    await api("/v1/admin/auth/reset", { method: "POST", body: { token: String(formData.get("token") ?? ""), password } });
  } catch (error) {
    return fail(error);
  }
  redirect("/admin/login?reset=1");
}

export async function credentialsAction(_: FormResult, formData: FormData): Promise<FormResult> {
  const token = await getAdminToken();
  if (token === null) redirect("/admin/login");
  const newEmail = String(formData.get("newEmail") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length > 0 && newPassword !== String(formData.get("confirm") ?? "")) {
    return { ok: false, code: "mismatch", message: "Passwords do not match", fields: { confirm: "Passwords do not match" } };
  }
  try {
    const result = await api<{ email: string }>("/v1/admin/auth/credentials", {
      method: "POST",
      adminSession: token,
      body: {
        currentPassword: String(formData.get("currentPassword") ?? ""),
        ...(newEmail.length > 0 ? { newEmail } : {}),
        ...(newPassword.length > 0 ? { newPassword } : {}),
      },
    });
    return { ok: true, message: `Saved. You are signed in as ${result.email}. Other devices were signed out.` };
  } catch (error) {
    return fail(error);
  }
}
