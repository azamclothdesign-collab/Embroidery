import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { pool } from "../../platform/db.ts";
import { parse } from "../../platform/http.ts";
import { requireReadyAdmin } from "../admin/adminGuard.ts";

/** Admin overview: sales KPIs, daily revenue series, top designs, things that need attention. */
export async function overviewRoutes(app: FastifyInstance): Promise<void> {
  app.get("/v1/admin/overview", { preHandler: requireReadyAdmin }, async (request) => {
    const { days } = parse(z.object({ days: z.coerce.number().int().refine((d) => [7, 30, 90].includes(d)).default(30) }), request.query);

    const [kpis, series, top, attention, recent] = await Promise.all([
      pool.query<{ revenue: string; orders: number; avg: string; customers: number; prev_revenue: string }>(
        `SELECT
           COALESCE(SUM(total_minor) FILTER (WHERE paid_at >= NOW() - make_interval(days => $1)), 0)::text AS revenue,
           COUNT(*) FILTER (WHERE paid_at >= NOW() - make_interval(days => $1))::int AS orders,
           COALESCE(AVG(total_minor) FILTER (WHERE paid_at >= NOW() - make_interval(days => $1)), 0)::text AS avg,
           COUNT(DISTINCT customer_email) FILTER (WHERE paid_at >= NOW() - make_interval(days => $1))::int AS customers,
           COALESCE(SUM(total_minor) FILTER (WHERE paid_at >= NOW() - make_interval(days => $1::int * 2)
             AND paid_at < NOW() - make_interval(days => $1)), 0)::text AS prev_revenue
         FROM orders WHERE status = 'paid'`,
        [days],
      ),
      pool.query<{ day: string; revenue: string; orders: number }>(
        `SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COALESCE(SUM(o.total_minor), 0)::text AS revenue, COUNT(o.id)::int AS orders
         FROM generate_series((NOW() AT TIME ZONE 'Asia/Karachi')::date - ($1::int - 1), (NOW() AT TIME ZONE 'Asia/Karachi')::date, INTERVAL '1 day') AS d(day)
         LEFT JOIN orders o ON o.status = 'paid' AND (o.paid_at AT TIME ZONE 'Asia/Karachi')::date = d.day
         GROUP BY d.day ORDER BY d.day`,
        [days],
      ),
      pool.query<{ slug: string; name_en: string; sold: number; revenue: string }>(
        `SELECT l.product_slug AS slug, MAX(l.name_en) AS name_en, COUNT(*)::int AS sold, SUM(l.price_minor)::text AS revenue
         FROM order_lines l JOIN orders o ON o.id = l.order_id
         WHERE o.status = 'paid' AND o.paid_at >= NOW() - make_interval(days => $1)
         GROUP BY l.product_slug ORDER BY sold DESC, revenue DESC LIMIT 5`,
        [days],
      ),
      pool.query<{ awaiting: number; proofs: number; messages: number; drafts: number; unpaid: number }>(
        `SELECT
           (SELECT COUNT(*)::int FROM orders WHERE status = 'awaiting_verification') AS awaiting,
           (SELECT COUNT(*)::int FROM bank_proofs WHERE status = 'pending') AS proofs,
           (SELECT COUNT(*)::int FROM contact_messages WHERE NOT is_read) AS messages,
           (SELECT COUNT(*)::int FROM products WHERE status = 'draft') AS drafts,
           (SELECT COUNT(*)::int FROM orders WHERE status = 'pending_payment' AND created_at > NOW() - INTERVAL '1 day') AS unpaid`,
      ),
      pool.query<{ number: string; customer_name: string; total_minor: number; status: string; payment_method: string; created_at: Date }>(
        `SELECT number, customer_name, total_minor, status, payment_method, created_at FROM orders ORDER BY created_at DESC LIMIT 6`,
      ),
    ]);

    const k = kpis.rows[0];
    return {
      days,
      revenueMinor: Number(k?.revenue ?? 0),
      previousRevenueMinor: Number(k?.prev_revenue ?? 0),
      paidOrders: k?.orders ?? 0,
      averageOrderMinor: Math.round(Number(k?.avg ?? 0)),
      customers: k?.customers ?? 0,
      series: series.rows.map((row) => ({ day: row.day, revenueMinor: Number(row.revenue), orders: row.orders })),
      topProducts: top.rows.map((row) => ({ slug: row.slug, name: row.name_en, sold: row.sold, revenueMinor: Number(row.revenue) })),
      attention: attention.rows[0] ?? { awaiting: 0, proofs: 0, messages: 0, drafts: 0, unpaid: 0 },
      recentOrders: recent.rows.map((row) => ({
        number: row.number, customerName: row.customer_name, totalMinor: row.total_minor, status: row.status,
        paymentMethod: row.payment_method, createdAt: row.created_at.toISOString(),
      })),
    };
  });
}
