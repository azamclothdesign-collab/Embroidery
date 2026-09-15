import { type NextRequest, NextResponse } from "next/server";

import { defaultLocale, locales } from "@/constants/locales";

function createContentSecurityPolicy(nonce: string, apiBaseUrl: string): string {
  const isDev = process.env.NODE_ENV === "development";

  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'"
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const styleSrc = isDev
    ? "style-src 'self' 'unsafe-inline'"
    : `style-src 'self' 'nonce-${nonce}'; style-src-attr 'unsafe-inline'`;

  const connectSrc = isDev
    ? `connect-src 'self' ${apiBaseUrl} ws: wss: http://localhost:* http://127.0.0.1:*`
    : `connect-src 'self' ${apiBaseUrl}`;

  return [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "img-src 'self' blob: data:",
    "media-src 'self'",
    "font-src 'self'",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (apiBaseUrl === undefined || apiBaseUrl === "") {
    throw new Error("API_BASE_URL is required");
  }

  const { pathname } = request.nextUrl;
  const matchedLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (matchedLocale === undefined) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = createContentSecurityPolicy(nonce, apiBaseUrl);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/|uploads/).*)"],
};
