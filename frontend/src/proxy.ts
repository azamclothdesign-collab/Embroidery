import { NextResponse, type NextRequest } from "next/server";
import { PAYMENT_FORM_HOSTS } from "./lib/site";

const LOCALES = ["en", "ur"];

function contentSecurityPolicy(nonce: string): string {
  const dev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    `form-action 'self' ${PAYMENT_FORM_HOSTS.join(" ")}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function preferredLocale(request: NextRequest): string {
  const saved = request.cookies.get("emb_locale")?.value;
  if (saved !== undefined && LOCALES.includes(saved)) return saved;
  const accept = request.headers.get("accept-language") ?? "";
  return /^ur\b|,\s*ur\b/i.test(accept) ? "ur" : "en";
}

/**
 * 1. Adds a per-request CSP nonce.
 * 2. Redirects locale-less storefront URLs to /en or /ur.
 * 3. Sends signed-out visitors of /admin/* to the login page (the backend
 *    still checks the session on every call; this is only a fast redirect).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const publicAdmin = ["/admin/login", "/admin/forgot", "/admin/reset"].some((path) => pathname.startsWith(path));
    if (!publicAdmin && request.cookies.get("emb_admin") === undefined) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  } else {
    const first = pathname.split("/")[1] ?? "";
    if (!LOCALES.includes(first)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
      url.search = search;
      return NextResponse.redirect(url, 308);
    }
  }

  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|media/|dl/|hooks/|fonts/|favicon|icon|apple-icon|og-default|robots.txt|sitemap.xml|llms.txt|manifest.webmanifest).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
