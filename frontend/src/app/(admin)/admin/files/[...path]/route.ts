import { NextResponse, type NextRequest } from "next/server";
import { requestIp } from "@/lib/api.server";
import { serverEnv } from "@/lib/env.server";
import { getAdminToken } from "@/lib/session.server";

/**
 * Admin-only file passthrough:
 *   /admin/files/proof/{id}                 → bank receipt image
 *   /admin/files/orders.csv?from=…&to=…    → order export
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const token = await getAdminToken();
  if (token === null) return NextResponse.redirect(new URL("/admin/login", request.url));

  let upstreamPath: string | null = null;
  if (path.length === 2 && path[0] === "proof" && /^[0-9a-f-]{36}$/i.test(path[1] ?? "")) {
    upstreamPath = `/v1/admin/proofs/${path[1]}/file`;
  } else if (path.length === 1 && path[0] === "orders.csv") {
    const from = request.nextUrl.searchParams.get("from") ?? "";
    const to = request.nextUrl.searchParams.get("to") ?? "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      upstreamPath = `/v1/admin/orders.csv?from=${from}&to=${to}`;
    }
  }
  if (upstreamPath === null) return NextResponse.json({ title: "Not found" }, { status: 404 });

  const upstream = await fetch(`${serverEnv.backendUrl}${upstreamPath}`, {
    headers: { "x-internal-key": serverEnv.internalKey, "x-admin-session": token, "x-client-ip": await requestIp() },
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  const headers = new Headers({ "cache-control": "private, no-store" });
  for (const name of ["content-type", "content-disposition"]) {
    const value = upstream.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  return new NextResponse(upstream.body, { status: upstream.status, headers });
}
