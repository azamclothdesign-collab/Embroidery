import { withTransaction } from "../../platform/db.ts";
import { getSetting } from "../../platform/settingsStore.ts";
import { audit } from "../admin/audit.ts";
import { sendOrderEmail } from "../orders/orderEmails.ts";
import { findOrderForUpdate, issueAccessToken, recordPaymentEvent, type Order } from "../orders/orders.repo.ts";

export type PaidInput = {
  orderId: string;
  provider: string;
  txnId: string | null;
  /** Amount the provider says it captured; null when the provider does not report it. */
  amountMinor: number | null;
  source: "gateway" | "admin";
  adminId?: string;
  ip?: string;
  payload: unknown;
};

export type PaidResult = { outcome: "paid" | "already_paid" | "amount_mismatch" | "refused"; order: Order };

/**
 * The only way an order becomes paid. Row-locked, idempotent, never moves a
 * refunded order, and refuses when the captured amount differs from the total.
 */
export async function markOrderPaid(input: PaidInput): Promise<PaidResult> {
  const store = await getSetting("store");
  const result = await withTransaction(async (db) => {
    const order = await findOrderForUpdate(input.orderId, db);
    if (order.status === "paid") return { outcome: "already_paid" as const, order, token: null };
    if (order.status === "refunded") return { outcome: "refused" as const, order, token: null };

    if (input.amountMinor !== null && input.amountMinor !== order.totalMinor) {
      await recordPaymentEvent(
        { orderId: order.id, provider: input.provider, kind: "amount_mismatch", eventKey: null, verified: true, payload: input.payload },
        db,
      );
      return { outcome: "amount_mismatch" as const, order, token: null };
    }

    await db.query(
      `UPDATE orders SET status = 'paid', paid_at = NOW(), provider_txn_id = COALESCE($2, provider_txn_id)
       WHERE id = $1 AND status <> 'paid'`,
      [order.id, input.txnId],
    );
    await recordPaymentEvent(
      {
        orderId: order.id,
        provider: input.provider,
        kind: input.source === "admin" ? "marked_paid_by_admin" : "paid",
        eventKey: input.txnId === null ? null : `paid:${input.txnId}`,
        verified: true,
        payload: input.payload,
      },
      db,
    );
    if (input.source === "admin") {
      await audit(input.adminId ?? null, "order.marked_paid", { number: order.number }, input.ip ?? "", db);
    }
    const token = await issueAccessToken(order.id, store.accessDays, db);
    return { outcome: "paid" as const, order: { ...order, status: "paid" as const }, token };
  });

  if (result.outcome === "paid" && result.token !== null) {
    await sendOrderEmail("paid", result.order, result.token);
  }
  return { outcome: result.outcome, order: result.order };
}

/** Failure only moves an order that is still waiting; a verified payment is never overwritten. */
export async function markOrderFailed(orderId: string, provider: string, payload: unknown): Promise<void> {
  await withTransaction(async (db) => {
    const order = await findOrderForUpdate(orderId, db);
    if (order.status !== "pending_payment") return;
    await db.query(`UPDATE orders SET status = 'failed' WHERE id = $1 AND status = 'pending_payment'`, [orderId]);
    await recordPaymentEvent({ orderId, provider, kind: "failed", eventKey: null, verified: true, payload }, db);
  });
}
