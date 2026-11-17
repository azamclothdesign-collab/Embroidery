import { NextResponse, type NextRequest } from "next/server";
import { requestIp } from "@/lib/api.server";
import { serverEnv } from "@/lib/env.server";
import { getOrderToken } from "@/lib/session.server";

const MAX_BYTES = 8 * 1024 * 1024 + 64 * 1024;

/** Streams a bank-receipt upload to the backend, adding the order token from the httpOnly cookie. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  if (!/^EMB-[0-9A-Z]{10}$/.test(number)) return NextResponse.json({ title: "Order not found" }, { status: 404 });
  const token = await getOrderToken(number);
  if (token === null) return NextResponse.json({ title: "Open the link from your email first" }, { status: 403 });

  const length = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(length) || length <= 0 || length > MAX_BYTES) {
    return NextResponse.json({ title: "File is too large (max 8 MB)" }, { status: 413 });
  }
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) return NextResponse.json({ title: "Invalid upload" }, { status: 400 });

  const reference = request.nextUrl.searchParams.get("ref")?.slice(0, 100) ?? "";
  const upstream = await fetch(`${serverEnv.backendUrl}/v1/orders/${number}/bank-proof`, {
    method: "POST",
    headers: {
      "content-type": contentType,
      "content-length": String(length),
      "x-internal-key": serverEnv.internalKey,
      "x-client-ip": await requestIp(),
      "x-order-token": token,
      "x-transaction-ref": encodeURIComponent(reference),
    },
    body: request.body,
    // Required by Node fetch when streaming a request body.
    duplex: "half",
    signal: AbortSignal.timeout(60_000),
  } as RequestInit & { duplex: "half" });

  const body = await upstream.text();
  return new NextResponse(body, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" } });
}
