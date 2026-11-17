import "server-only";
import { headers } from "next/headers";
import { serverEnv } from "./env.server";

export type ApiProblem = {
  status: number;
  code: string;
  title: string;
  fields?: Record<string, string>;
  requestId?: string;
};

export class ApiError extends Error {
  readonly problem: ApiProblem;
  constructor(problem: ApiProblem) {
    super(problem.title);
    this.name = "ApiError";
    this.problem = problem;
  }
  get status(): number {
    return this.problem.status;
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  adminSession?: string;
  idempotencyKey?: string;
  timeoutMs?: number;
  extraHeaders?: Record<string, string>;
};

/** Client IP as seen by nginx (it overwrites X-Real-IP with $remote_addr). */
export async function requestIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0] ?? "").trim().slice(0, 64) || "0.0.0.0";
}

/**
 * Calls the backend from the Next.js server. Never used in the browser.
 * Reads: 5 s deadline. Writes: 10 s. Non-2xx → ApiError with the problem body.
 */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? (method === "GET" ? 5_000 : 10_000);
  const requestHeaders: Record<string, string> = {
    accept: "application/json",
    "x-internal-key": serverEnv.internalKey,
    "x-client-ip": await requestIp(),
    ...options.extraHeaders,
  };
  if (options.body !== undefined) requestHeaders["content-type"] = "application/json";
  if (options.adminSession !== undefined) requestHeaders["x-admin-session"] = options.adminSession;
  if (options.idempotencyKey !== undefined) requestHeaders["idempotency-key"] = options.idempotencyKey;

  let response: Response;
  try {
    response = await fetch(`${serverEnv.backendUrl}${path}`, {
      method,
      headers: requestHeaders,
      ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ApiError({ status: 503, code: "backend_unreachable", title: "The store is temporarily unavailable. Please try again." });
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text.length > 0 ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    const problem = (data ?? {}) as Partial<ApiProblem>;
    throw new ApiError({
      status: response.status,
      code: problem.code ?? "error",
      title: problem.title ?? "Something went wrong",
      ...(problem.fields === undefined ? {} : { fields: problem.fields }),
      ...(problem.requestId === undefined ? {} : { requestId: problem.requestId }),
    });
  }
  return data as T;
}

/** Turns "not found" into null for pages that call notFound(). */
export async function apiOrNull<T>(path: string, options: Options = {}): Promise<T | null> {
  try {
    return await api<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
