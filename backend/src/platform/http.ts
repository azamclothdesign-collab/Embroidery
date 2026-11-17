import type { FastifyReply, FastifyRequest } from "fastify";
import type { z } from "zod";
import { config } from "./config.ts";
import { safeEqual } from "./crypto.ts";
import { AppError, type FieldErrors } from "./errors.ts";

/** Validates unknown input; turns zod issues into a 400 with per-field messages. */
export function parse<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  throw new AppError(400, "validation_failed", "Please check the highlighted fields", { fields });
}

/**
 * Internal routes are called only by the Next.js server. It proves itself with
 * INTERNAL_API_KEY and forwards the browser IP in x-client-ip.
 */
export async function requireInternal(request: FastifyRequest): Promise<void> {
  const header = request.headers["x-internal-key"];
  if (typeof header !== "string" || !safeEqual(header, config.INTERNAL_API_KEY)) {
    throw new AppError(401, "unauthorized", "Missing internal credentials");
  }
}

/**
 * Real client IP. Trusted only when the request carries the internal key
 * (from Next.js) or comes through nginx (X-Real-IP set from $remote_addr).
 */
export function clientIp(request: FastifyRequest): string {
  const forwarded = request.headers["x-client-ip"];
  const internal = request.headers["x-internal-key"];
  if (typeof forwarded === "string" && typeof internal === "string" && safeEqual(internal, config.INTERNAL_API_KEY)) {
    return forwarded.slice(0, 64);
  }
  const realIp = request.headers["x-real-ip"];
  if (typeof realIp === "string" && (request.ip === "127.0.0.1" || request.ip === "::1")) {
    return realIp.slice(0, 64);
  }
  return request.ip;
}

export function sendProblem(reply: FastifyReply, error: AppError, requestId: string): FastifyReply {
  if (error.retryAfterSeconds !== undefined) {
    reply.header("Retry-After", String(error.retryAfterSeconds));
  }
  return reply
    .status(error.status)
    .type("application/problem+json")
    .send({
      type: "about:blank",
      title: error.message,
      status: error.status,
      code: error.code,
      fields: error.fields,
      requestId,
    });
}

export function htmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Auto-submitting form used to bounce the browser to a payment provider. */
export function autoPostHtml(action: string, fields: Record<string, string>, title = "Redirecting…"): string {
  const inputs = Object.entries(fields)
    .map(([name, value]) => `<input type="hidden" name="${htmlEscape(name)}" value="${htmlEscape(value)}">`)
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${htmlEscape(
    title,
  )}</title></head><body><form id="f" method="post" action="${htmlEscape(action)}">${inputs}<noscript><button type="submit">Continue</button></noscript></form><script>document.getElementById("f").submit()</script></body></html>`;
}
