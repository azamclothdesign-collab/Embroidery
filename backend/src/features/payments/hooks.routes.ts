import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { config } from "../../platform/config.ts";
import { pool } from "../../platform/db.ts";
import { autoPostHtml, clientIp } from "../../platform/http.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { findOrder, recordPaymentEvent, type Order } from "../orders/orders.repo.ts";
import { markOrderFailed, markOrderPaid } from "./markPaid.ts";
import { getMethod } from "./methods.repo.ts";
import { endpointsFor, type MethodCode } from "./methodSpecs.ts";
import { easypaisa, easypaisaReturnUrl } from "./providers/easypaisa.ts";
import { jazzcash, jazzcashStatus, verifyJazzcashResponse } from "./providers/jazzcash.ts";
import { isPayfastSuccess, readPayfastCallback, verifyPayfastCallback } from "./providers/payfast.ts";

/**
 * Public provider callbacks (nginx routes /hooks/* here). Nothing from the
 * browser is trusted: every success is either signed with our secret or
 * re-confirmed with the provider's API before markOrderPaid runs.
 */
function params(request: FastifyRequest): Record<string, string> {
  const source = { ...(request.query as Record<string, unknown>), ...((request.body ?? {}) as Record<string, unknown>) };
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string" && key.length <= 64) out[key] = value.slice(0, 1000);
  }
  return out;
}

async function orderByReference(code: MethodCode, reference: string): Promise<Order | null> {
  if (reference.length === 0 || reference.length > 40) return null;
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM orders WHERE payment_method = $1 AND provider_reference = $2`,
    [code, reference],
  );
  const id = result.rows[0]?.id;
  return id === undefined ? null : findOrder({ id });
}

function backToOrder(reply: FastifyReply, order: Order | null, outcome: string): FastifyReply {
  const target =
    order === null ? `${config.SITE_URL}/en/track?payment=unknown` : `${config.SITE_URL}/${order.locale}/order/${order.number}?payment=${outcome}`;
  return reply.redirect(target, 303);
}

async function handlePayfast(request: FastifyRequest): Promise<{ order: Order | null; outcome: string }> {
  const data = params(request);
  const callback = readPayfastCallback(data);
  const method = await getMethod("payfast");
  const verified = verifyPayfastCallback(callback, method);
  // Looked up even when unverified, but only to send the shopper back to their order page.
  const order = await orderByReference("payfast", callback.basketId);
  await recordPaymentEvent({
    orderId: order?.id ?? null, provider: "payfast", kind: "callback", verified,
    eventKey: verified && callback.txnId ? `cb:${callback.txnId}:${callback.errCode}` : null, payload: data,
  });
  if (!verified || order === null) return { order, outcome: "unverified" };
  if (isPayfastSuccess(callback.errCode)) {
    const result = await markOrderPaid({
      orderId: order.id, provider: "payfast", txnId: callback.txnId || null, amountMinor: callback.amountMinor,
      source: "gateway", payload: data,
    });
    return { order, outcome: result.outcome === "amount_mismatch" ? "review" : "success" };
  }
  await markOrderFailed(order.id, "payfast", data);
  return { order, outcome: "failed" };
}

export async function hookRoutes(app: FastifyInstance): Promise<void> {
  const guard = async (request: FastifyRequest) => consume(`hook:${clientIp(request)}`, policies.upload);

  // PayFast server-to-server notification.
  app.route({
    method: ["GET", "POST"],
    url: "/hooks/payfast/ipn",
    preHandler: guard,
    handler: async (request, reply) => {
      await handlePayfast(request);
      return reply.type("text/plain").send("OK");
    },
  });

  // PayFast browser return (success or failure).
  app.route({
    method: ["GET", "POST"],
    url: "/hooks/payfast/return",
    preHandler: guard,
    handler: async (request, reply) => {
      const { order, outcome } = await handlePayfast(request);
      return backToOrder(reply, order, outcome);
    },
  });

  app.post("/hooks/jazzcash/return", { preHandler: guard }, async (request, reply) => {
    const data = params(request);
    const method = await getMethod("jazzcash");
    const verified = verifyJazzcashResponse(data, method.config.integritySalt ?? "");
    const order = await orderByReference("jazzcash", data.pp_TxnRefNo ?? "");
    await recordPaymentEvent({ orderId: order?.id ?? null, provider: "jazzcash", kind: "return", verified, eventKey: null, payload: { ...data, pp_SecureHash: undefined } });
    if (!verified || order === null) return backToOrder(reply, order, "unverified");

    const returned = jazzcashStatus(data.pp_ResponseCode ?? "");
    if (returned === "failed") {
      await markOrderFailed(order.id, "jazzcash", data);
      return backToOrder(reply, order, "failed");
    }
    // Confirm with the inquiry API; fall back to the signed return if inquiry is unavailable.
    const inquiry = await jazzcash.inquire(order, method).catch(() => null);
    const status = inquiry !== null && inquiry.status !== "unknown" ? inquiry.status : returned;
    if (status === "paid") {
      const amount = inquiry?.amountMinor ?? Number.parseInt(data.pp_Amount ?? "", 10);
      const result = await markOrderPaid({
        orderId: order.id, provider: "jazzcash", txnId: inquiry?.txnId ?? data.pp_RetreivalReferenceNo ?? data.pp_TxnRefNo ?? null,
        amountMinor: Number.isFinite(amount) ? amount : null, source: "gateway", payload: { ...data, pp_SecureHash: undefined },
      });
      return backToOrder(reply, order, result.outcome === "amount_mismatch" ? "review" : "success");
    }
    return backToOrder(reply, order, status === "pending" ? "pending" : "failed");
  });

  // Easypaisa uses the same postBackURL twice: first with auth_token, then with the result.
  app.route({
    method: ["GET", "POST"],
    url: "/hooks/easypaisa/return",
    preHandler: guard,
    handler: async (request, reply) => {
      const data = params(request);
      const method = await getMethod("easypaisa");

      if ((data.auth_token ?? "").length > 0) {
        const confirm = endpointsFor("easypaisa", method.mode).confirm ?? "";
        return reply
          .type("text/html; charset=utf-8")
          .header("Cache-Control", "no-store")
          .send(autoPostHtml(confirm, { auth_token: data.auth_token ?? "", postBackURL: easypaisaReturnUrl() }));
      }

      const order = await orderByReference("easypaisa", data.orderRefNumber ?? data.orderRefNum ?? "");
      await recordPaymentEvent({ orderId: order?.id ?? null, provider: "easypaisa", kind: "return", verified: false, eventKey: null, payload: data });
      if (order === null) return backToOrder(reply, null, "unknown");

      const inquiry = await easypaisa.inquire(order, method).catch(() => null);
      if (inquiry?.status === "paid") {
        const result = await markOrderPaid({
          orderId: order.id, provider: "easypaisa", txnId: inquiry.txnId, amountMinor: inquiry.amountMinor,
          source: "gateway", payload: inquiry.raw,
        });
        return backToOrder(reply, order, result.outcome === "amount_mismatch" ? "review" : "success");
      }
      if (inquiry?.status === "failed") await markOrderFailed(order.id, "easypaisa", inquiry.raw);
      return backToOrder(reply, order, inquiry?.status ?? "pending");
    },
  });
}
