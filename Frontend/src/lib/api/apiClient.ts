import { maxJsonBytes } from "@/constants/httpLimits";
import { createSignedRequestHeaders } from "@/lib/api/hmacSigner";
import { writeLog } from "@/lib/structuredLogger";
import { env } from "@/schemas/envSchema";
import {
  type ApiEnvelope,
  isApiFailureEnvelope,
} from "@/types/apiEnvelope";

import "server-only";

export type FetchCacheStrategy =
  | { cache: "force-cache" }
  | { cache: "no-store" }
  | { next: { revalidate: number } };

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export type ApiRequestContext = {
  customerSessionToken?: string | undefined;
  adminSessionToken?: string | undefined;
  guestToken?: string | undefined;
};

type RequestApiJsonOptions = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  cacheStrategy: FetchCacheStrategy;
  context?: ApiRequestContext | undefined;
  maxResponseBytes?: number | undefined;
};

function applySessionHeaders(
  headers: Headers,
  context: ApiRequestContext | undefined,
): void {
  if (context?.customerSessionToken !== undefined) {
    headers.set("x-customer-session", context.customerSessionToken);
  }

  if (context?.adminSessionToken !== undefined) {
    headers.set("x-admin-session", context.adminSessionToken);
  }

  if (context?.guestToken !== undefined) {
    headers.set("x-guest-token", context.guestToken);
  }
}

export async function buildApiRequestContext(): Promise<ApiRequestContext> {
  const { readSessionCookies } = await import("@/server/session/cookies");
  return readSessionCookies();
}

export async function requestApiJson<TData>(
  options: RequestApiJsonOptions,
): Promise<TData> {
  return requestApiJsonWithContext<TData>(options);
}

export async function requestApiJsonWithContext<TData>(
  options: RequestApiJsonOptions,
): Promise<TData> {
  const serializedBody =
    options.body === undefined ? "" : JSON.stringify(options.body);
  const url = new URL(options.path, env.API_BASE_URL);
  const signedHeaders = createSignedRequestHeaders(
    options.method,
    `${url.pathname}${url.search}`,
    serializedBody,
  );

  const headers = new Headers({
    Accept: "application/json",
    Origin: env.APP_ORIGIN,
    ...signedHeaders,
  });

  const context =
    options.context === undefined
      ? await buildApiRequestContext()
      : options.context;
  applySessionHeaders(headers, context);

  if (serializedBody !== "") {
    headers.set("Content-Type", "application/json");
  }

  const requestInit: RequestInit = {
    method: options.method,
    headers,
    ...options.cacheStrategy,
  };

  if (serializedBody !== "") {
    requestInit.body = serializedBody;
  }

  const response = await fetch(url, requestInit);

  const payload = await response.arrayBuffer();
  const responseLimit = options.maxResponseBytes ?? maxJsonBytes;

  if (payload.byteLength > responseLimit) {
    writeLog("error", "api_response_too_large", {
      queryName: options.path,
    });
    throw new ApiClientError(413, "payload_too_large", "Payload too large");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(new TextDecoder().decode(payload)) as unknown;
  } catch {
    writeLog("error", "api_response_not_json", {
      queryName: options.path,
    });
    throw new ApiClientError(500, "invalid_response", "Invalid response");
  }

  if (isApiFailureEnvelope(parsed)) {
    throw new ApiClientError(
      response.status,
      parsed.error.code,
      parsed.error.message,
    );
  }

  if (!response.ok) {
    writeLog("error", "api_request_failed", {
      queryName: options.path,
    });
    throw new ApiClientError(response.status, "request_failed", "Request failed");
  }

  const envelope = parsed as ApiEnvelope<TData>;

  if (!("data" in envelope)) {
    writeLog("error", "api_envelope_invalid", {
      queryName: options.path,
    });
    throw new ApiClientError(500, "invalid_envelope", "Invalid response");
  }

  return envelope.data;
}
