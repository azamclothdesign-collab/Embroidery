import { NextResponse, type NextRequest } from "next/server";
import { api, ApiError } from "@/lib/api.server";
import { rememberOrderToken } from "@/lib/session.server";
import { absoluteUrl } from "@/lib/site";

/**
 * Email links land here: /{locale}/order/{number}/access?t=TOKEN
 * We check the token with the backend, keep it in an httpOnly cookie and
 * redirect to the clean order URL (so the token never stays in the address bar).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string; number: string }> }) {
  const { locale, number } = await params;
  const safeLocale = locale === "ur" ? "ur" : "en";
  const token = request.nextUrl.searchParams.get("t") ?? "";
  const target = absoluteUrl(`/${safeLocale}/order/${encodeURIComponent(number)}`);

  if (!/^EMB-[0-9A-Z]{10}$/.test(number) || token.length < 20 || token.length > 200) {
    return NextResponse.redirect(absoluteUrl(`/${safeLocale}/track`), 303);
  }
  try {
    await api(`/v1/orders/${number}/view`, { method: "POST", body: { token } });
    await rememberOrderToken(number, token);
    const response = NextResponse.redirect(target, 303);
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return NextResponse.redirect(absoluteUrl(`/${safeLocale}/track?expired=1`), 303);
    }
    throw error;
  }
}
