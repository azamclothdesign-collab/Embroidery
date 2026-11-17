import { createReadStream } from "node:fs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { pool, withTransaction } from "../../platform/db.ts";
import { badRequest, conflict, notFound } from "../../platform/errors.ts";
import { clientIp, parse } from "../../platform/http.ts";
import { getSetting } from "../../platform/settingsStore.ts";
import { dirs, removeQuietly, resolveInside } from "../../platform/storage.ts";
import { audit } from "../admin/audit.ts";
import { getAdmin, requireReadyAdmin } from "../admin/adminGuard.ts";
import { markOrderPaid } from "../payments/markPaid.ts";
import { METHOD_CODES } from "../payments/methodSpecs.ts";
import { sendOrderEmail } from "./orderEmails.ts";
import { findOrder, issueAccessToken, listOrders, listPaymentEvents } from "./orders.repo.ts";
import { numberParam } from "./orders.routes.ts";

const STATUSES = ["pending_payment", "awaiting_verification", "paid", "failed", "cancelled", "refunded"] as const;

function csvCell(value: string | number): string {
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text; // block spreadsheet formula injection
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function orderAdminRoutes(app: FastifyInstance): Promise<void> {
  app.get("/v1/admin/orders", { preHandler: requireReadyAdmin }, async (request) => {
    const query = parse(
      z.object({
        status: z.enum(STATUSES).optional(),
        method: z.enum(METHOD_CODES).optional(),
        q: z.string().trim().max(80).optional(),
        page: z.coerce.number().int().min(1).max(500).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
      }),
      request.query,
    );
    return listOrders({
      page: query.page,
      limit: query.limit,
      ...(query.status === undefined ? {} : { status: query.status }),
      ...(query.method === undefined ? {} : { method: query.method }),
      ...(query.q === undefined ? {} : { q: query.q }),
    });
  });

  app.get("/v1/admin/orders/:number", { preHandler: requireReadyAdmin }, async (request) => {
    const { number } = parse(numberParam, request.params);
    const order = await findOrder({ number });
    const proofs = await pool.query<{ id: string; status: string; transaction_ref: string; created_at: Date }>(
      `SELECT id, status, transaction_ref, created_at FROM bank_proofs WHERE order_id = $1 ORDER BY created_at DESC`,
      [order.id],
    );
    return {
      order,
      events: await listPaymentEvents(order.id),
      proofs: proofs.rows.map((row) => ({ ...row, created_at: row.created_at.toISOString() })),
    };
  });

  app.post("/v1/admin/orders/:number/mark-paid", { preHandler: requireReadyAdmin }, async (request) => {
    const { number } = parse(numberParam, request.params);
    const order = await findOrder({ number });
    const admin = getAdmin(request);
    const result = await markOrderPaid({
      orderId: order.id, provider: order.paymentMethod, txnId: null, amountMinor: null, source: "admin",
      adminId: admin.id, ip: clientIp(request), payload: { by: admin.email },
    });
    if (result.outcome === "refused") throw conflict("order_refunded", "A refunded order cannot be marked paid");
    return { outcome: result.outcome };
  });

  app.post("/v1/admin/orders/:number/status", { preHandler: requireReadyAdmin }, async (request) => {
    const { number } = parse(numberParam, request.params);
    const { status } = parse(z.object({ status: z.enum(["cancelled", "refunded", "failed"]) }), request.body);
    const order = await findOrder({ number });
    if (status === "refunded" && order.status !== "paid") throw badRequest("not_paid", "Only paid orders can be refunded");
    if (status !== "refunded" && order.status === "paid") throw conflict("order_paid", "Paid orders can only be refunded");
    await pool.query(`UPDATE orders SET status = $2 WHERE id = $1`, [order.id, status]);
    await audit(getAdmin(request).id, `order.${status}`, { number }, clientIp(request));
    return { status };
  });

  app.post("/v1/admin/orders/:number/resend", { preHandler: requireReadyAdmin }, async (request) => {
    const { number } = parse(numberParam, request.params);
    const order = await findOrder({ number });
    const store = await getSetting("store");
    const token = await issueAccessToken(order.id, store.accessDays);
    const sent = await sendOrderEmail(order.status === "paid" ? "paid" : "link", order, token);
    await audit(getAdmin(request).id, "order.link_resent", { number, sent }, clientIp(request));
    return { sent };
  });

  app.post("/v1/admin/orders/:number/reset-downloads", { preHandler: requireReadyAdmin }, async (request) => {
    const { number } = parse(numberParam, request.params);
    const order = await findOrder({ number });
    await pool.query(`UPDATE order_lines SET download_count = 0 WHERE order_id = $1`, [order.id]);
    await audit(getAdmin(request).id, "order.downloads_reset", { number }, clientIp(request));
    return { ok: true };
  });

  app.delete("/v1/admin/orders/:number", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { number } = parse(numberParam, request.params);
    const order = await findOrder({ number });
    const proofs = await pool.query<{ file_path: string }>(`SELECT file_path FROM bank_proofs WHERE order_id = $1`, [order.id]);
    await withTransaction(async (db) => {
      // order_lines use ON DELETE RESTRICT — remove them before the order row.
      await db.query(`DELETE FROM order_lines WHERE order_id = $1`, [order.id]);
      await db.query(`DELETE FROM orders WHERE id = $1`, [order.id]);
    });
    for (const proof of proofs.rows) {
      await removeQuietly(resolveInside(dirs.proofs, proof.file_path));
    }
    await audit(getAdmin(request).id, "order.deleted", { number, id: order.id }, clientIp(request));
    return reply.status(204).send();
  });

  app.post("/v1/admin/orders/:number/proofs/:id/:decision", { preHandler: requireReadyAdmin }, async (request) => {
    const params = parse(numberParam.extend({ id: z.uuid(), decision: z.enum(["approve", "reject"]) }), request.params);
    const order = await findOrder({ number: params.number });
    const admin = getAdmin(request);
    const updated = await pool.query(
      `UPDATE bank_proofs SET status = $3, reviewed_by = $4, reviewed_at = NOW()
       WHERE id = $1 AND order_id = $2 AND status = 'pending'`,
      [params.id, order.id, params.decision === "approve" ? "approved" : "rejected", admin.id],
    );
    if (updated.rowCount === 0) throw notFound("Pending receipt");
    if (params.decision === "approve") {
      await markOrderPaid({
        orderId: order.id, provider: "bank", txnId: null, amountMinor: null, source: "admin",
        adminId: admin.id, ip: clientIp(request), payload: { proofId: params.id },
      });
    } else {
      await audit(admin.id, "order.proof_rejected", { number: order.number }, clientIp(request));
    }
    return { ok: true };
  });

  app.get("/v1/admin/proofs/:id/file", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { id } = parse(z.object({ id: z.uuid() }), request.params);
    const result = await pool.query<{ file_path: string }>(`SELECT file_path FROM bank_proofs WHERE id = $1`, [id]);
    const row = result.rows[0];
    if (row === undefined) throw notFound("Receipt");
    return reply
      .header("Content-Type", "image/webp")
      .header("Cache-Control", "private, no-store")
      .send(createReadStream(resolveInside(dirs.proofs, row.file_path)));
  });

  app.get("/v1/admin/orders.csv", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const query = parse(z.object({ from: z.iso.date(), to: z.iso.date() }), request.query);
    const result = await pool.query<{
      number: string; created_at: Date; status: string; payment_method: string; customer_name: string;
      customer_email: string; customer_phone: string; total_minor: number; coupon_code: string | null;
    }>(
      `SELECT number, created_at, status, payment_method, customer_name, customer_email, customer_phone, total_minor, coupon_code
       FROM orders WHERE created_at >= $1::date AND created_at < ($2::date + 1) ORDER BY created_at DESC LIMIT 20000`,
      [query.from, query.to],
    );
    const header = ["Order", "Date", "Status", "Method", "Name", "Email", "Phone", "Total (PKR)", "Coupon"];
    const lines = result.rows.map((row) =>
      [row.number, row.created_at.toISOString(), row.status, row.payment_method, row.customer_name, row.customer_email,
        row.customer_phone, (row.total_minor / 100).toFixed(2), row.coupon_code ?? ""].map(csvCell).join(","),
    );
    await audit(getAdmin(request).id, "order.exported", { from: query.from, to: query.to, rows: result.rowCount }, clientIp(request));
    return reply
      .header("Content-Type", "text/csv; charset=utf-8")
      .header("Content-Disposition", `attachment; filename="orders-${query.from}-to-${query.to}.csv"`)
      .send(`﻿${header.map(csvCell).join(",")}\n${lines.join("\n")}\n`);
  });
}
