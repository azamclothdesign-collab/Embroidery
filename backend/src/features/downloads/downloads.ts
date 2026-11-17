import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { config } from "../../platform/config.ts";
import { hmacHex, safeEqual } from "../../platform/crypto.ts";
import { pool } from "../../platform/db.ts";
import { AppError } from "../../platform/errors.ts";
import { clientIp, parse } from "../../platform/http.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { getSetting } from "../../platform/settingsStore.ts";
import { dirs, resolveInside } from "../../platform/storage.ts";

const LINK_MINUTES = 60;

/** Short-lived signed link for one order line. Authorization happened before calling this. */
export function signedDownloadUrl(lineId: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + LINK_MINUTES * 60;
  const sig = hmacHex(config.DOWNLOAD_SIGNING_KEY, `${lineId}.${exp}`);
  return `${config.SITE_URL}/dl/${lineId}?exp=${exp}&sig=${sig}`;
}

export function verifyDownloadSignature(lineId: string, exp: number, sig: string, now = Date.now()): boolean {
  if (exp * 1000 < now) return false;
  return safeEqual(sig, hmacHex(config.DOWNLOAD_SIGNING_KEY, `${lineId}.${exp}`));
}

function contentDisposition(name: string): string {
  const ascii = name.replaceAll(/[^\x20-\x7e]/g, "_").replaceAll('"', "");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/**
 * Public route (nginx → backend): GET /dl/:lineId?exp&sig
 * Re-checks that the order is paid and the download limit is not used up,
 * then streams the ZIP. Counts the download atomically.
 */
export async function downloadRoutes(app: FastifyInstance): Promise<void> {
  app.get("/dl/:lineId", async (request, reply) => {
    const { lineId } = parse(z.object({ lineId: z.uuid() }), request.params);
    const query = parse(z.object({ exp: z.coerce.number().int(), sig: z.string().regex(/^[a-f0-9]{64}$/) }), request.query);
    await consume(`dl:${clientIp(request)}`, policies.read);

    if (!verifyDownloadSignature(lineId, query.exp, query.sig)) {
      throw new AppError(403, "link_expired", "This download link has expired. Open your order page to get a fresh one.");
    }

    const store = await getSetting("store");
    const result = await pool.query<{ package_path: string; package_name: string }>(
      `UPDATE order_lines l SET download_count = l.download_count + 1
       FROM orders o
       WHERE l.id = $1 AND o.id = l.order_id AND o.status = 'paid' AND l.download_count < $2
       RETURNING l.package_path, l.package_name`,
      [lineId, store.downloadLimit],
    );
    const row = result.rows[0];
    if (row === undefined) {
      throw new AppError(403, "download_unavailable", "Download limit reached or order not paid. Please contact support.");
    }

    const filePath = resolveInside(dirs.packages, row.package_path);
    const info = await stat(filePath).catch(() => null);
    if (info === null) {
      await pool.query(`UPDATE order_lines SET download_count = GREATEST(download_count - 1, 0) WHERE id = $1`, [lineId]);
      request.log.error({ lineId }, "package file missing on disk");
      throw new AppError(410, "file_missing", "This file is temporarily unavailable. Please contact support.");
    }

    return reply
      .header("Content-Type", "application/zip")
      .header("Content-Length", String(info.size))
      .header("Content-Disposition", contentDisposition(row.package_name))
      .header("Cache-Control", "private, no-store")
      .header("X-Robots-Tag", "noindex")
      .send(createReadStream(filePath));
  });
}
