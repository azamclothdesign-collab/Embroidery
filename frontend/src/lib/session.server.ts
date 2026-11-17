import "server-only";
import { cookies } from "next/headers";

const isProd = process.env.NODE_ENV === "production";

// ---------- Admin session (path-scoped to /admin) ----------
export const ADMIN_COOKIE = "emb_admin";

export async function getAdminToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value ?? null;
}

export async function setAdminToken(token: string, expiresAt: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/admin",
    expires: new Date(expiresAt),
  });
}

export async function clearAdminToken(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", { httpOnly: true, secure: isProd, sameSite: "strict", path: "/admin", maxAge: 0 });
}

// ---------- Customer order access (number → token, last 10 orders) ----------
export const ORDERS_COOKIE = "emb_orders";
const MAX_ORDERS = 10;

async function readOrders(): Promise<Record<string, string>> {
  const store = await cookies();
  const raw = store.get(ORDERS_COOKIE)?.value;
  if (raw === undefined) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        (entry): entry is [string, string] => /^EMB-[0-9A-Z]{10}$/.test(entry[0]) && typeof entry[1] === "string",
      ),
    );
  } catch {
    return {};
  }
}

export async function getOrderToken(number: string): Promise<string | null> {
  return (await readOrders())[number] ?? null;
}

/** Only callable from Server Actions / Route Handlers (cookie writes). */
export async function rememberOrderToken(number: string, token: string): Promise<void> {
  const current = await readOrders();
  delete current[number];
  const entries = [...Object.entries(current), [number, token] as const].slice(-MAX_ORDERS);
  const store = await cookies();
  store.set(ORDERS_COOKIE, JSON.stringify(Object.fromEntries(entries)), {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
