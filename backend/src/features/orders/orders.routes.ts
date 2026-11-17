import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { badRequest, notFound } from "../../platform/errors.ts";
import { clientIp, parse, requireInternal } from "../../platform/http.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { METHOD_CODES } from "../payments/methodSpecs.ts";
import { isOrderNumber } from "./orderNumber.ts";
import { findOrder, orderIdForToken } from "./orders.repo.ts";
import { createOrder, customerView, emailOrderLink, quote } from "./orders.service.ts";

const slugList = z.array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)).min(1).max(50);
export const numberParam = z.object({ number: z.string().refine(isOrderNumber, "Invalid order number") });
const couponCode = z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/).nullable();

const checkoutBody = z.object({
  items: slugList,
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email").max(254),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replaceAll(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+92|0092|0)?3\d{9}$|^\+?\d{10,15}$/, "Enter a valid phone number")),
  method: z.enum(METHOD_CODES),
  couponCode,
  locale: z.enum(["en", "ur"]),
});

/** Resolves the order behind a customer access token or throws 404 (never reveals which part was wrong). */
export async function orderFromToken(number: string, token: string) {
  const id = await orderIdForToken(number, token);
  if (id === null) throw notFound("Order");
  return findOrder({ id });
}

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  app.post("/v1/checkout/quote", { preHandler: requireInternal }, async (request) => {
    const body = parse(z.object({ items: slugList, couponCode }), request.body);
    await consume(`quote:${clientIp(request)}`, policies.read);
    return quote(body.items, body.couponCode);
  });

  app.post("/v1/orders", { preHandler: requireInternal }, async (request, reply) => {
    const key = request.headers["idempotency-key"];
    if (typeof key !== "string" || !/^[A-Za-z0-9_-]{16,100}$/.test(key)) {
      throw badRequest("idempotency_key_required", "Missing Idempotency-Key header");
    }
    const body = parse(checkoutBody, request.body);
    const ip = clientIp(request);
    await consume(`checkout:${ip}`, policies.checkout);
    const result = await createOrder({ ...body, idempotencyKey: key, ip });
    return reply.status(201).send(result);
  });

  app.post("/v1/orders/:number/view", { preHandler: requireInternal }, async (request) => {
    const { number } = parse(numberParam, request.params);
    const { token } = parse(z.object({ token: z.string().min(20).max(200) }), request.body);
    await consume(`order-view:${clientIp(request)}`, policies.read);
    return customerView(await orderFromToken(number, token));
  });

  app.post("/v1/orders/lookup", { preHandler: requireInternal }, async (request, reply) => {
    const body = parse(z.object({ number: z.string().trim().toUpperCase().refine(isOrderNumber, "Invalid order number"), email: z.email() }), request.body);
    await consume(`lookup:${clientIp(request)}`, policies.lookup);
    await emailOrderLink(body.number, body.email);
    return reply.status(202).send({ ok: true });
  });
}
