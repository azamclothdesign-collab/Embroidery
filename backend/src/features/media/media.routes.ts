import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { config } from "../../platform/config.ts";
import { pool } from "../../platform/db.ts";
import { badRequest } from "../../platform/errors.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { dirs, moveInto, removeQuietly } from "../../platform/storage.ts";
import { getAdmin, requireReadyAdmin } from "../admin/adminGuard.ts";
import { sniffImage, writeImageVariants } from "./images.ts";
import { receiveFile } from "./upload.ts";
import { inspectZip } from "./zipInspect.ts";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export async function mediaRoutes(app: FastifyInstance): Promise<void> {
  app.post("/v1/admin/media/image", { preHandler: requireReadyAdmin }, async (request) => {
    await consume(`upload:${getAdmin(request).id}`, policies.upload);
    const upload = await receiveFile(request, MAX_IMAGE_BYTES);
    try {
      if (sniffImage(upload.head) === null) {
        throw badRequest("invalid_image", "Upload a JPG, PNG, WebP, AVIF or GIF image");
      }
      const result = await writeImageVariants(upload.tmpPath, randomUUID());
      return { path: result.base, width: result.width, height: result.height };
    } catch (error) {
      if (error instanceof Error && !("status" in error)) {
        throw badRequest("invalid_image", error.message);
      }
      throw error;
    } finally {
      await removeQuietly(upload.tmpPath);
    }
  });

  app.post("/v1/admin/media/package", { preHandler: requireReadyAdmin }, async (request) => {
    await consume(`upload:${getAdmin(request).id}`, policies.upload);
    const upload = await receiveFile(request, config.MAX_ZIP_MB * 1024 * 1024);
    let moved = false;
    try {
      if (!upload.filename.toLowerCase().endsWith(".zip")) {
        throw badRequest("invalid_zip", "Only .zip files are accepted");
      }
      let report;
      try {
        report = await inspectZip(upload.tmpPath);
      } catch (error) {
        throw badRequest("invalid_zip", (error as Error).message);
      }

      const id = randomUUID();
      await moveInto(upload.tmpPath, dirs.packages, `${id}.zip`);
      moved = true;
      await pool.query(`INSERT INTO package_uploads (id, original_name, size_bytes, files) VALUES ($1, $2, $3, $4::jsonb)`, [
        id,
        upload.filename,
        upload.size,
        JSON.stringify(report.files.slice(0, 500)),
      ]);
      return { packageId: id, name: upload.filename, size: upload.size, files: report.files.slice(0, 500) };
    } finally {
      if (!moved) await removeQuietly(upload.tmpPath);
    }
  });
}
