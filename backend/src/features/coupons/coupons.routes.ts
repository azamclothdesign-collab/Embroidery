import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { isUniqueViolation, pool } from "../../platform/db.ts";
import { conflict, notFound } from "../../platform/errors.ts";
import { clientIp, parse } from "../../platform/http.ts";
import { audit } from "../admin/audit.ts";
import { getAdmin, requireReadyAdmin } from "../admin/adminGuard.ts";

const couponInput = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/, "3–32 letters, numbers, - or _"),
    kind: z.enum(["percent", "fixed"]),
    value: z.number().int().min(1),
    minSubtotalMinor: z.number().int().min(0),
    maxUses: z.number().int().min(1).nullable(),
    startsAt: z.iso.datetime({ offset: true }).nullable(),
    endsAt: z.iso.datetime({ offset: true }).nullable(),
    isActive: z.boolean(),
  })
  .refine((value) => value.kind !== "percent" || value.value <= 100, { message: "Max 100%", path: ["value"] })
  .refine((value) => value.startsAt === null || value.endsAt === null || value.startsAt < value.endsAt, {
    message: "End must be after start",
    path: ["endsAt"],
  });

const idParam = z.object({ id: z.uuid() });

export async function couponRoutes(app: FastifyInstance): Promise<void> {
  app.get("/v1/admin/coupons", { preHandler: requireReadyAdmin }, async () => {
    const result = await pool.query(
      `SELECT id, code, kind, value, min_subtotal_minor AS "minSubtotalMinor", max_uses AS "maxUses",
         used_count AS "usedCount", starts_at AS "startsAt", ends_at AS "endsAt", is_active AS "isActive"
       FROM coupons ORDER BY created_at DESC LIMIT 200`,
    );
    return { items: result.rows };
  });

  const save = async (id: string | null, body: unknown, adminId: string, ip: string) => {
    const input = parse(couponInput, body);
    const values = [input.code, input.kind, input.value, input.minSubtotalMinor, input.maxUses, input.startsAt, input.endsAt, input.isActive];
    try {
      if (id === null) {
        const created = await pool.query<{ id: string }>(
          `INSERT INTO coupons (code, kind, value, min_subtotal_minor, max_uses, starts_at, ends_at, is_active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          values,
        );
        await audit(adminId, "coupon.created", { code: input.code }, ip);
        return created.rows[0]?.id ?? "";
      }
      const updated = await pool.query(
        `UPDATE coupons SET code=$1, kind=$2, value=$3, min_subtotal_minor=$4, max_uses=$5, starts_at=$6, ends_at=$7, is_active=$8
         WHERE id = $9`,
        [...values, id],
      );
      if (updated.rowCount === 0) throw notFound("Coupon");
      await audit(adminId, "coupon.updated", { code: input.code }, ip);
      return id;
    } catch (error) {
      if (isUniqueViolation(error)) throw conflict("code_taken", "This coupon code already exists");
      throw error;
    }
  };

  app.post("/v1/admin/coupons", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const id = await save(null, request.body, getAdmin(request).id, clientIp(request));
    return reply.status(201).send({ id });
  });

  app.put("/v1/admin/coupons/:id", { preHandler: requireReadyAdmin }, async (request) => {
    const { id } = parse(idParam, request.params);
    return { id: await save(id, request.body, getAdmin(request).id, clientIp(request)) };
  });

  app.delete("/v1/admin/coupons/:id", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { id } = parse(idParam, request.params);
    await pool.query(`DELETE FROM coupons WHERE id = $1`, [id]);
    await audit(getAdmin(request).id, "coupon.deleted", { id }, clientIp(request));
    return reply.status(204).send();
  });
}
