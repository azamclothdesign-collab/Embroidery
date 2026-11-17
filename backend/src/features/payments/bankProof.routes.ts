import { randomUUID } from "node:crypto";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import sharp from "sharp";
import { z } from "zod";
import { pool } from "../../platform/db.ts";
import { badRequest, conflict } from "../../platform/errors.ts";
import { clientIp, parse, requireInternal } from "../../platform/http.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { dirs, removeQuietly } from "../../platform/storage.ts";
import { sniffImage } from "../media/images.ts";
import { receiveFile } from "../media/upload.ts";
import { recordPaymentEvent } from "../orders/orders.repo.ts";
import { numberParam, orderFromToken } from "../orders/orders.routes.ts";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Customer uploads a bank-transfer receipt (image). Stored outside the web
 * root, re-encoded to WebP (drops any embedded payload), reviewed by admin.
 */
export async function bankProofRoutes(app: FastifyInstance): Promise<void> {
  app.post("/v1/orders/:number/bank-proof", { preHandler: requireInternal }, async (request, reply) => {
    const { number } = parse(numberParam, request.params);
    const headers = parse(
      z.object({
        "x-order-token": z.string().min(20).max(200),
        "x-transaction-ref": z.string().max(200).optional(),
      }),
      request.headers,
    );
    await consume(`proof:${clientIp(request)}`, policies.mutation);
    const order = await orderFromToken(number, headers["x-order-token"]);
    if (order.paymentMethod !== "bank") throw badRequest("not_bank", "This order does not use bank transfer");
    if (order.status === "paid") throw conflict("already_paid", "This order is already paid");

    const pending = await pool.query<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM bank_proofs WHERE order_id = $1 AND status = 'pending'`,
      [order.id],
    );
    if ((pending.rows[0]?.count ?? 0) >= 3) throw conflict("too_many_receipts", "We already have your receipt and will review it soon");

    const upload = await receiveFile(request, MAX_BYTES);
    const fileName = `${randomUUID()}.webp`;
    try {
      if (sniffImage(upload.head) === null) throw badRequest("invalid_image", "Upload a photo or screenshot (JPG, PNG or WebP)");
      await sharp(upload.tmpPath, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(dirs.proofs, fileName));
    } catch (error) {
      if (error instanceof Error && !("status" in error)) throw badRequest("invalid_image", "This image could not be read");
      throw error;
    } finally {
      await removeQuietly(upload.tmpPath);
    }

    const transactionRef = decodeURIComponentSafe(headers["x-transaction-ref"] ?? "").trim().slice(0, 100);
    await pool.query(`INSERT INTO bank_proofs (order_id, file_path, transaction_ref) VALUES ($1, $2, $3)`, [
      order.id,
      fileName,
      transactionRef,
    ]);
    await recordPaymentEvent({ orderId: order.id, provider: "bank", kind: "receipt_uploaded", eventKey: null, verified: false, payload: { transactionRef } });
    return reply.status(201).send({ ok: true });
  });
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
