import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import Fastify, { type FastifyInstance } from "fastify";
import { config, isProduction } from "./platform/config.ts";
import { AppError } from "./platform/errors.ts";
import { sendProblem } from "./platform/http.ts";
import { dirs } from "./platform/storage.ts";
import { adminAuthRoutes } from "./features/admin/adminAuth.routes.ts";
import { catalogRoutes } from "./features/catalog/catalog.routes.ts";
import { contentRoutes } from "./features/content/content.routes.ts";
import { couponRoutes } from "./features/coupons/coupons.routes.ts";
import { overviewRoutes } from "./features/dashboard/overview.routes.ts";
import { downloadRoutes } from "./features/downloads/downloads.ts";
import { mediaRoutes } from "./features/media/media.routes.ts";
import { orderAdminRoutes } from "./features/orders/orders.admin.routes.ts";
import { orderRoutes } from "./features/orders/orders.routes.ts";
import { bankProofRoutes } from "./features/payments/bankProof.routes.ts";
import { hookRoutes } from "./features/payments/hooks.routes.ts";
import { paymentRoutes } from "./features/payments/payments.routes.ts";
import { pool } from "./platform/db.ts";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: isProduction ? "info" : "debug",
      redact: {
        paths: [
          "req.headers['x-internal-key']",
          "req.headers['x-admin-session']",
          "req.headers['x-order-token']",
          "req.headers.authorization",
          "req.headers.cookie",
        ],
        remove: true,
      },
    },
    bodyLimit: 256 * 1024,
    requestTimeout: 30_000,
    connectionTimeout: 60_000,
    keepAliveTimeout: 65_000,
    trustProxy: false,
    genReqId: () => crypto.randomUUID(),
    maxParamLength: 200,
  });

  await app.register(formbody, { bodyLimit: 64 * 1024 });
  await app.register(multipart, { limits: { fileSize: config.MAX_ZIP_MB * 1024 * 1024, files: 1, fields: 5, parts: 6 } });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) return sendProblem(reply, error, request.id);

    const status = (error as { statusCode?: number }).statusCode;
    if (typeof status === "number" && status >= 400 && status < 500) {
      // Fastify's own client errors (bad JSON, body too large, malformed URL …)
      return sendProblem(reply, new AppError(status, (error as { code?: string }).code ?? "bad_request", "Invalid request"), request.id);
    }
    request.log.error({ err: error }, "unhandled error");
    return sendProblem(reply, new AppError(500, "internal_error", "Something went wrong on our side"), request.id);
  });

  app.setNotFoundHandler((request, reply) => sendProblem(reply, new AppError(404, "not_found", "Route not found"), request.id));

  app.get("/health/live", async () => ({ ok: true }));
  app.get("/health/ready", async (_request, reply) => {
    try {
      await pool.query("SELECT 1");
      return { ok: true };
    } catch {
      return reply.status(503).send({ ok: false });
    }
  });

  // nginx serves /media/ from STORAGE_DIR/media in production. This route covers
  // local development and installs without nginx; files are WebP made by us.
  app.get("/media/:file", async (request, reply) => {
    const { file } = request.params as { file: string };
    if (!/^[a-f0-9-]{36}-(400|800|1600)\.webp$/.test(file)) throw new AppError(404, "not_found", "Not found");
    const info = await stat(path.join(dirs.media, file)).catch(() => null);
    if (info === null) throw new AppError(404, "not_found", "Not found");
    return reply
      .header("Content-Type", "image/webp")
      .header("Cache-Control", "public, max-age=31536000, immutable")
      .send(createReadStream(path.join(dirs.media, file)));
  });

  await app.register(adminAuthRoutes);
  await app.register(catalogRoutes);
  await app.register(mediaRoutes);
  await app.register(orderRoutes);
  await app.register(orderAdminRoutes);
  await app.register(paymentRoutes);
  await app.register(bankProofRoutes);
  await app.register(hookRoutes);
  await app.register(downloadRoutes);
  await app.register(contentRoutes);
  await app.register(couponRoutes);
  await app.register(overviewRoutes);

  return app;
}
