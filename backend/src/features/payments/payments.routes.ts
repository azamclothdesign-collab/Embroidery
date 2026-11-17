import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { pool } from "../../platform/db.ts";
import { AppError, badRequest, conflict } from "../../platform/errors.ts";
import { clientIp, parse, requireInternal } from "../../platform/http.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { audit } from "../admin/audit.ts";
import { getAdmin, requireReadyAdmin } from "../admin/adminGuard.ts";
import { findOrder, recordPaymentEvent } from "../orders/orders.repo.ts";
import { numberParam, orderFromToken } from "../orders/orders.routes.ts";
import { markOrderPaid } from "./markPaid.ts";
import { getMethod, listMethods, maskForAdmin, methodUpdate, publicMethods, requireActiveMethod, saveMethod } from "./methods.repo.ts";
import { METHOD_CODES } from "./methodSpecs.ts";
import { newReference, providers } from "./providers/index.ts";

const codeParam = z.object({ code: z.enum(METHOD_CODES) });

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.get("/v1/payment-methods", { preHandler: requireInternal }, async () => ({ items: await publicMethods() }));

  /** Starts (or retries) a hosted payment. Returns the form the browser must post. */
  app.post("/v1/orders/:number/pay", { preHandler: requireInternal }, async (request) => {
    const { number } = parse(numberParam, request.params);
    const { token } = parse(z.object({ token: z.string().min(20).max(200) }), request.body);
    await consume(`pay:${clientIp(request)}`, policies.checkout);
    const order = await orderFromToken(number, token);

    if (order.status === "paid") throw conflict("already_paid", "This order is already paid");
    if (order.status !== "pending_payment" && order.status !== "failed") {
      throw badRequest("not_payable", "This order cannot be paid online");
    }
    const provider = providers[order.paymentMethod];
    if (provider === undefined) throw badRequest("manual_method", "This order uses a manual payment method");
    const method = await requireActiveMethod(order.paymentMethod);

    const reference = newReference(order.paymentMethod, order);
    await pool.query(`UPDATE orders SET provider_reference = $2, status = 'pending_payment' WHERE id = $1 AND status <> 'paid'`, [
      order.id,
      reference,
    ]);
    try {
      const form = await provider.start({ ...order, providerReference: reference }, method, reference);
      await recordPaymentEvent({ orderId: order.id, provider: order.paymentMethod, kind: "started", eventKey: null, verified: true, payload: { reference } });
      return form;
    } catch (error) {
      request.log.error({ err: error, number }, "payment start failed");
      await recordPaymentEvent({
        orderId: order.id, provider: order.paymentMethod, kind: "start_failed", eventKey: null, verified: true,
        payload: { reference, error: (error as Error).message },
      });
      throw new AppError(502, "provider_unavailable", "The payment provider is not responding. Please try again in a minute.");
    }
  });

  // ---------- Admin ----------
  app.get("/v1/admin/payment-methods", { preHandler: requireReadyAdmin }, async () => ({
    items: (await listMethods()).map(maskForAdmin),
  }));

  app.put("/v1/admin/payment-methods/:code", { preHandler: requireReadyAdmin }, async (request) => {
    const { code } = parse(codeParam, request.params);
    const input = parse(methodUpdate, request.body);
    const saved = await saveMethod(code, input);
    await audit(
      getAdmin(request).id,
      "payment_method.updated",
      { code, enabled: input.enabled, mode: input.mode, changedKeys: Object.keys(input.config).filter((key) => (input.config[key] ?? "").length > 0) },
      clientIp(request),
    );
    return maskForAdmin(saved);
  });

  app.post("/v1/admin/payment-methods/:code/test", { preHandler: requireReadyAdmin }, async (request) => {
    const { code } = parse(codeParam, request.params);
    const provider = providers[code];
    if (provider === undefined) return { ok: true, message: "Manual method — nothing to test" };
    await consume(`gateway-test:${getAdmin(request).id}`, policies.mutation);
    return provider.test(await getMethod(code));
  });

  /** Asks the provider for the real status (reconciliation). */
  app.post("/v1/admin/orders/:number/recheck", { preHandler: requireReadyAdmin }, async (request) => {
    const { number } = parse(numberParam, request.params);
    const order = await findOrder({ number });
    const provider = providers[order.paymentMethod];
    if (provider === undefined) return { status: "manual", message: "Manual method: verify the receipt yourself" };
    const result = await provider.inquire(order, await getMethod(order.paymentMethod));
    await recordPaymentEvent({ orderId: order.id, provider: order.paymentMethod, kind: "inquiry", eventKey: null, verified: true, payload: result.raw });
    if (result.status === "paid") {
      const paid = await markOrderPaid({
        orderId: order.id, provider: order.paymentMethod, txnId: result.txnId, amountMinor: result.amountMinor,
        source: "gateway", payload: { via: "admin_recheck" },
      });
      return { status: paid.outcome, message: result.message };
    }
    return { status: result.status, message: result.message };
  });
}
