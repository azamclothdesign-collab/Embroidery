import { NextResponse, type NextRequest } from "next/server";
import { requestIp } from "@/lib/api.server";
import { serverEnv } from "@/lib/env.server";
import { getAdminToken } from "@/lib/session.server";

/**
 * Streams admin uploads (images, ZIP packages) straight to the backend.
 * Route handlers have no Server Action body limit, and the file is never
 * buffered in memory here. The backend enforces type and size limits.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (kind !== "image" && kind !== "package") return NextResponse.json({ title: "Not found" }, { status: 404 });
  const token = await getAdminToken();
  if (token === null) return NextResponse.json({ title: "Please sign in again" }, { status: 401 });

  const origin = request.headers.get("origin");
  if (origin !== null && origin !== request.nextUrl.origin) {
    return NextResponse.json({ title: "Cross-site upload blocked" }, { status: 403 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) return NextResponse.json({ title: "Invalid upload" }, { status: 400 });

  const headers: Record<string, string> = {
    "content-type": contentType,
    "x-internal-key": serverEnv.internalKey,
    "x-admin-session": token,
    "x-client-ip": await requestIp(),
  };
  const length = request.headers.get("content-length");
  if (length !== null) headers["content-length"] = length;

  const upstream = await fetch(`${serverEnv.backendUrl}/v1/admin/media/${kind}`, {
    method: "POST",
    headers,
    body: request.body,
    duplex: "half",
    signal: AbortSignal.timeout(10 * 60_000),
  } as RequestInit & { duplex: "half" });

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
