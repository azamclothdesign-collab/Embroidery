import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { hmacTimestampWindowSeconds } from "../../constants/httpLimits.js";
import { env } from "../../schemas/envSchema.js";
import {
  nonceExists,
  pruneExpiredNonces,
  storeNonce,
} from "../database/repositories/auth/nonces.js";

export type HmacHeaderValues = {
  timestamp: string;
  nonce: string;
  bodyHash: string;
  signature: string;
};

export function readHmacHeaders(
  headers: Record<string, string | string[] | undefined>,
): HmacHeaderValues | null {
  const timestamp = readHeader(headers, "x-timestamp");
  const nonce = readHeader(headers, "x-nonce");
  const bodyHash = readHeader(headers, "x-body-hash");
  const signature = readHeader(headers, "x-signature");

  if (
    timestamp === null ||
    nonce === null ||
    bodyHash === null ||
    signature === null
  ) {
    return null;
  }

  return { timestamp, nonce, bodyHash, signature };
}

function readHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | null {
  const value = headers[name];

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return null;
}

export function hashRequestBody(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

export function buildCanonicalRequest(
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  bodyHash: string,
): string {
  return `${method}${path}${timestamp}${nonce}${bodyHash}`;
}

export function signCanonicalRequest(canonical: string): string {
  return createHmac("sha256", env.HMAC_SIGNING_SECRET)
    .update(canonical)
    .digest("hex");
}

export function signaturesMatch(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

export async function verifySignedRequest(input: {
  method: string;
  path: string;
  body: string;
  headers: Record<string, string | string[] | undefined>;
}): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const hmacHeaders = readHmacHeaders(input.headers);

  if (hmacHeaders === null) {
    return { ok: false, code: "unauthenticated", message: "Unauthorized" };
  }

  const requestTimestamp = Number(hmacHeaders.timestamp);

  if (!Number.isFinite(requestTimestamp)) {
    return { ok: false, code: "unauthenticated", message: "Unauthorized" };
  }

  const ageSeconds = Math.abs(Math.floor(Date.now() / 1000) - requestTimestamp);

  if (ageSeconds > hmacTimestampWindowSeconds) {
    return { ok: false, code: "expired_request", message: "Unauthorized" };
  }

  const bodyHash = hashRequestBody(input.body);

  if (bodyHash !== hmacHeaders.bodyHash) {
    return { ok: false, code: "unauthenticated", message: "Unauthorized" };
  }

  const canonical = buildCanonicalRequest(
    input.method,
    input.path,
    hmacHeaders.timestamp,
    hmacHeaders.nonce,
    hmacHeaders.bodyHash,
  );
  const expectedSignature = signCanonicalRequest(canonical);

  if (!signaturesMatch(expectedSignature, hmacHeaders.signature)) {
    return { ok: false, code: "unauthenticated", message: "Unauthorized" };
  }

  await pruneExpiredNonces(new Date());

  if (await nonceExists(hmacHeaders.nonce)) {
    return { ok: false, code: "replay_detected", message: "Unauthorized" };
  }

  const expiresAt = new Date(Date.now() + hmacTimestampWindowSeconds * 1000);
  await storeNonce(hmacHeaders.nonce, expiresAt);

  return { ok: true };
}
