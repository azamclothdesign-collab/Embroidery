import { type IncomingMessage, type ServerResponse } from "node:http";

import { type ApiFailureEnvelope, type ApiSuccessEnvelope } from "../../types/apiEnvelope.js";

export type HandlerContext = {
  req: IncomingMessage;
  res: ServerResponse;
  method: string;
  path: string;
  params: Record<string, string>;
  body: string;
  parsedBody: unknown;
  correlationId: string;
  clientIp: string;
  customerId?: string;
  adminUserId?: string;
  guestToken?: string;
  sendJson: <TData>(status: number, data: TData) => void;
  sendError: (status: number, code: string, message: string) => void;
};

export type ApiHandler = (context: HandlerContext) => Promise<void>;

export type HandlerModule = {
  handle: ApiHandler;
  requireHmac?: boolean;
  requireOrigin?: boolean;
};

export function sendJsonEnvelope<TData>(
  res: ServerResponse,
  status: number,
  data: TData,
): void {
  const envelope: ApiSuccessEnvelope<TData> = { data };
  const payload = JSON.stringify(envelope);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(payload);
}

export function sendErrorEnvelope(
  res: ServerResponse,
  status: number,
  code: string,
  message: string,
): void {
  const envelope: ApiFailureEnvelope = {
    error: { code, message },
  };
  const payload = JSON.stringify(envelope);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(payload);
}

export function readClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.length > 0) {
    const first = forwarded.split(",")[0]?.trim();
    if (first !== undefined && first.length > 0) {
      return first;
    }
  }

  return req.socket.remoteAddress ?? "unknown";
}

export function readOrigin(req: IncomingMessage): string | null {
  const origin = req.headers.origin;

  if (typeof origin === "string" && origin.length > 0) {
    return origin;
  }

  const referer = req.headers.referer;

  if (typeof referer === "string" && referer.length > 0) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }

  return null;
}

export function readHeader(
  req: IncomingMessage,
  name: string,
): string | null {
  const value = req.headers[name];

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return null;
}

export async function readRequestBody(
  req: IncomingMessage,
  maxBytes: number,
): Promise<{ ok: true; body: string } | { ok: false }> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.byteLength;

    if (total > maxBytes) {
      return { ok: false };
    }

    chunks.push(buffer);
  }

  return { ok: true, body: Buffer.concat(chunks).toString("utf8") };
}
