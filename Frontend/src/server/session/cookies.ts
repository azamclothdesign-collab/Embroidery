import { randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import "server-only";

export const customerSessionCookieName = "x-customer-session";
export const adminSessionCookieName = "x-admin-session";
export const guestTokenCookieName = "x-guest-token";
export const guestWishlistCookieName = "embroidery-guest-wishlist";

const customerSessionMaxAgeSeconds = 7 * 24 * 60 * 60;
const adminSessionMaxAgeSeconds = 8 * 60 * 60;
const guestTokenMaxAgeSeconds = 30 * 24 * 60 * 60;
const guestWishlistMaxAgeSeconds = 30 * 24 * 60 * 60;

export type SessionCookies = {
  customerSessionToken?: string | undefined;
  adminSessionToken?: string | undefined;
  guestToken?: string | undefined;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function readSessionCookies(): Promise<SessionCookies> {
  const jar = await cookies();
  const result: SessionCookies = {};
  const customerToken = jar.get(customerSessionCookieName)?.value;

  if (customerToken !== undefined && customerToken.length > 0) {
    result.customerSessionToken = customerToken;
  }

  const adminToken = jar.get(adminSessionCookieName)?.value;

  if (adminToken !== undefined && adminToken.length > 0) {
    result.adminSessionToken = adminToken;
  }

  const guestToken = jar.get(guestTokenCookieName)?.value;

  if (guestToken !== undefined && guestToken.length > 0) {
    result.guestToken = guestToken;
  }

  return result;
}

export async function setCustomerSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(customerSessionCookieName, token, cookieOptions(customerSessionMaxAgeSeconds));
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(customerSessionCookieName);
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(adminSessionCookieName, token, cookieOptions(adminSessionMaxAgeSeconds));
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(adminSessionCookieName);
}

export function createGuestToken(): string {
  return randomBytes(32).toString("hex");
}

export async function readGuestToken(): Promise<string | undefined> {
  const jar = await cookies();
  const value = jar.get(guestTokenCookieName)?.value;

  if (value === undefined || value.length === 0) {
    return undefined;
  }

  return value;
}

export async function setGuestTokenCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(guestTokenCookieName, token, cookieOptions(guestTokenMaxAgeSeconds));
}

export async function ensureGuestTokenCookie(): Promise<string> {
  const existing = await readGuestToken();

  if (existing !== undefined) {
    return existing;
  }

  const token = createGuestToken();
  await setGuestTokenCookie(token);
  return token;
}

export async function readGuestWishlistSlugs(): Promise<string[]> {
  const jar = await cookies();
  const raw = jar.get(guestWishlistCookieName)?.value;

  if (raw === undefined || raw.length === 0) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export async function writeGuestWishlistSlugs(slugs: readonly string[]): Promise<void> {
  const jar = await cookies();
  jar.set(
    guestWishlistCookieName,
    JSON.stringify([...slugs]),
    cookieOptions(guestWishlistMaxAgeSeconds),
  );
}

export async function clearGuestWishlistCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(guestWishlistCookieName);
}
