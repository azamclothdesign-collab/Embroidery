import { createHash, createHmac, randomBytes } from "node:crypto";

import { env } from "@/schemas/envSchema";

import "server-only";

export type SignedRequestHeaders = {
  "x-timestamp": string;
  "x-nonce": string;
  "x-body-hash": string;
  "x-signature": string;
};

export function createSignedRequestHeaders(
  method: string,
  path: string,
  body: string,
): SignedRequestHeaders {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString("hex");
  const bodyHash = createHash("sha256").update(body).digest("hex");
  const canonical = `${method}${path}${timestamp}${nonce}${bodyHash}`;
  const signature = createHmac("sha256", env.HMAC_SIGNING_SECRET)
    .update(canonical)
    .digest("hex");

  return {
    "x-timestamp": timestamp,
    "x-nonce": nonce,
    "x-body-hash": bodyHash,
    "x-signature": signature,
  };
}
