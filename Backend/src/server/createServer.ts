import { randomUUID } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";

import {
  maxPackageUploadBodyBytes,
  maxRequestBodyBytes,
  maxUploadBodyBytes,
} from "../constants/httpLimits.js";
import { readAllowedOrigins } from "../schemas/envSchema.js";
import { writeLog } from "../utils/structuredLogger.js";
import { verifySignedRequest } from "./auth/hmacVerifier.js";
import { consumeRateLimitToken } from "./database/repositories/rateLimit/tokenBucket.js";
import { parseJsonBody } from "../utils/parseHandlerBody.js";
import {
  readClientIp,
  readOrigin,
  readRequestBody,
  sendErrorEnvelope,
  sendJsonEnvelope,
  type HandlerContext,
} from "./middleware/handlerTypes.js";
import { resolveRequestSessions } from "./middleware/resolveSessions.js";
import { loadResolvedRoute } from "./pathResolver.js";

function setSecureHeaders(res: ServerResponse): void {
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
}

function originAllowed(origin: string | null): boolean {
  if (origin === null) {
    return false;
  }

  return readAllowedOrigins().includes(origin);
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const startedAt = Date.now();
  const correlationId = randomUUID();
  setSecureHeaders(res);

  if (req.url === undefined || req.method === undefined) {
    sendErrorEnvelope(res, 400, "invalid_request", "Invalid request");
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const method = req.method.toUpperCase();
  const path = url.pathname;
  const clientIp = readClientIp(req);

  try {
    const rateLimit = await consumeRateLimitToken(`${clientIp}:${method}:${path}`);

    if (!rateLimit.allowed) {
      res.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
      sendErrorEnvelope(res, 429, "rate_limited", "Too many requests");
      return;
    }

    const resolved = await loadResolvedRoute(method, path);

    if (resolved === null) {
      sendErrorEnvelope(res, 404, "not_found", "Not found");
      return;
    }

    const bodyLimit =
      method === "POST" && path === "/admin/media/upload"
        ? maxUploadBodyBytes
        : method === "POST" && path === "/admin/media/package"
          ? maxPackageUploadBodyBytes
          : maxRequestBodyBytes;
    const bodyResult = await readRequestBody(req, bodyLimit);

    if (!bodyResult.ok) {
      sendErrorEnvelope(res, 413, "payload_too_large", "Payload too large");
      return;
    }

    const requireHmac = resolved.module.requireHmac ?? true;
    const requireOrigin = resolved.module.requireOrigin ?? method !== "GET";

    if (requireOrigin && !originAllowed(readOrigin(req))) {
      sendErrorEnvelope(res, 403, "forbidden", "Forbidden");
      return;
    }

    if (requireHmac) {
      const verification = await verifySignedRequest({
        method,
        path: `${url.pathname}${url.search}`,
        body: bodyResult.body,
        headers: req.headers,
      });

      if (!verification.ok) {
        sendErrorEnvelope(res, 401, verification.code, verification.message);
        return;
      }
    }

    const sessions = await resolveRequestSessions(req);
    const parsedBody = parseJsonBody(bodyResult.body);

    const context: HandlerContext = {
      req,
      res,
      method,
      path,
      params: resolved.params,
      body: bodyResult.body,
      parsedBody,
      correlationId,
      clientIp,
      sendJson: (status, data) => {
        sendJsonEnvelope(res, status, data);
      },
      sendError: (status, code, message) => {
        sendErrorEnvelope(res, status, code, message);
      },
    };

    if (sessions.customerId !== undefined) {
      context.customerId = sessions.customerId;
    }

    if (sessions.adminUserId !== undefined) {
      context.adminUserId = sessions.adminUserId;
    }

    if (sessions.guestToken !== undefined) {
      context.guestToken = sessions.guestToken;
    }

    await resolved.module.handle(context);
  } catch {
    writeLog("error", "unhandled_request_error", { correlationId });
    sendErrorEnvelope(res, 500, "internal_error", "Internal server error");
  } finally {
    writeLog("info", "request_completed", {
      correlationId,
      durationMs: Date.now() - startedAt,
      queryName: path,
    });
  }
}

export function createHttpServer(): Server {
  return createServer((req, res) => {
    void handleRequest(req, res);
  });
}
