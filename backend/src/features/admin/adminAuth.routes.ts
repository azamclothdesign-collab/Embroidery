import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { clientIp, parse, requireInternal } from "../../platform/http.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { getAdmin, requireAdmin } from "./adminGuard.ts";
import { changeCredentials, login, logout, requestPasswordReset, resetPassword } from "./adminAuth.service.ts";

const email = z.email().max(254);
export const passwordRule = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(128)
  .refine((value) => /[a-zA-Z]/.test(value) && /\d/.test(value), "Use letters and numbers");

export async function adminAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post("/v1/admin/auth/login", { preHandler: requireInternal }, async (request) => {
    const body = parse(z.object({ email, password: z.string().min(1).max(128) }), request.body);
    const ip = clientIp(request);
    await consume(`login:ip:${ip}`, policies.login);
    await consume(`login:email:${body.email.toLowerCase()}`, { capacity: 10, refillPerSecond: 1 / 60 });
    return login(body.email, body.password, ip, String(request.headers["user-agent"] ?? ""));
  });

  app.post("/v1/admin/auth/logout", { preHandler: requireAdmin }, async (request, reply) => {
    await logout(getAdmin(request).sessionHash);
    return reply.status(204).send();
  });

  app.get("/v1/admin/auth/me", { preHandler: requireAdmin }, async (request) => {
    const admin = getAdmin(request);
    return { id: admin.id, email: admin.email, mustChangePassword: admin.mustChangePassword };
  });

  app.post("/v1/admin/auth/forgot", { preHandler: requireInternal }, async (request, reply) => {
    const body = parse(z.object({ email }), request.body);
    const ip = clientIp(request);
    await consume(`reset:ip:${ip}`, policies.passwordReset);
    await requestPasswordReset(body.email, ip);
    return reply.status(202).send({ ok: true });
  });

  app.post("/v1/admin/auth/reset", { preHandler: requireInternal }, async (request, reply) => {
    const body = parse(z.object({ token: z.string().min(20).max(200), password: passwordRule }), request.body);
    const ip = clientIp(request);
    await consume(`reset-confirm:ip:${ip}`, policies.login);
    await resetPassword(body.token, body.password, ip);
    return reply.status(204).send();
  });

  app.post("/v1/admin/auth/credentials", { preHandler: requireAdmin }, async (request) => {
    const body = parse(
      z
        .object({
          currentPassword: z.string().min(1).max(128),
          newEmail: email.optional(),
          newPassword: passwordRule.optional(),
        })
        .refine((value) => value.newEmail !== undefined || value.newPassword !== undefined, {
          message: "Change the email, the password or both",
          path: ["newPassword"],
        }),
      request.body,
    );
    const admin = getAdmin(request);
    await consume(`credentials:${admin.id}`, policies.login);
    return changeCredentials({
      adminId: admin.id,
      sessionHash: admin.sessionHash,
      currentPassword: body.currentPassword,
      newEmail: body.newEmail,
      newPassword: body.newPassword,
      ip: clientIp(request),
    });
  });
}
