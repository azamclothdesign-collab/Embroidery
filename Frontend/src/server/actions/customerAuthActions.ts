"use server";

import { ApiClientError } from "@/lib/api/apiClient";
import {
  changePassword,
  forgotPassword,
  getCustomerSession,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "@/lib/api/authApi";
import { fetchWishlist, updateWishlist } from "@/lib/api/wishlistApi";
import {
  clearCustomerSessionCookie,
  clearGuestWishlistCookie,
  readGuestWishlistSlugs,
  setCustomerSessionCookie,
} from "@/server/session/cookies";
import { type CustomerSessionView } from "@/types/api/auth";

async function mergeGuestWishlistAfterAuth(): Promise<void> {
  const guestSlugs = await readGuestWishlistSlugs();

  if (guestSlugs.length === 0) {
    return;
  }

  try {
    const current = await fetchWishlist();
    const merged = [...new Set([...guestSlugs, ...current.items.map((item) => item.slug)])];
    await updateWishlist(merged);
    await clearGuestWishlistCookie();
  } catch {
    return;
  }
}

export async function registerCustomerAction(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword: string;
}): Promise<
  { ok: true; session: CustomerSessionView } | { ok: false; error: string }
> {
  try {
    const result = await registerCustomer(input);
    await setCustomerSessionCookie(result.sessionToken);
    await mergeGuestWishlistAfterAuth();
    return { ok: true, session: result.session };
  } catch (error) {
    if (error instanceof ApiClientError && error.code === "conflict") {
      return { ok: false, error: "exists" };
    }

    return { ok: false, error: "failed" };
  }
}

export async function loginCustomerAction(input: {
  email: string;
  password: string;
}): Promise<
  { ok: true; session: CustomerSessionView } | { ok: false; error: string }
> {
  try {
    const result = await loginCustomer(input);
    await setCustomerSessionCookie(result.sessionToken);
    await mergeGuestWishlistAfterAuth();
    return { ok: true, session: result.session };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return { ok: false, error: "invalid" };
    }

    return { ok: false, error: "failed" };
  }
}

export async function logoutCustomerAction(): Promise<{ ok: true }> {
  try {
    await logoutCustomer();
  } catch {
    return { ok: true };
  }

  await clearCustomerSessionCookie();
  return { ok: true };
}

export async function getCustomerSessionAction(): Promise<CustomerSessionView | null> {
  try {
    return await getCustomerSession();
  } catch {
    return null;
  }
}

export async function forgotPasswordAction(input: {
  email: string;
  password?: string | undefined;
  confirmPassword?: string | undefined;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await forgotPassword(input);
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return { ok: false, error: "missing" };
    }

    return { ok: false, error: "failed" };
  }
}

export async function changePasswordAction(input: {
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
