import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { encryptSecret } from "../../platform/crypto.ts";
import { isUniqueViolation, pool } from "../../platform/db.ts";
import { conflict, notFound } from "../../platform/errors.ts";
import { clientIp, htmlEscape, parse, requireInternal } from "../../platform/http.ts";
import { emailLayout, sendMail, verifySmtp } from "../../platform/mailer.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { getSetting, saveSetting, settingSchemas } from "../../platform/settingsStore.ts";
import { audit, listAudit } from "../admin/audit.ts";
import { getAdmin, requireReadyAdmin } from "../admin/adminGuard.ts";
import { slugRule } from "../catalog/catalog.schemas.ts";

const EDITABLE = ["store", "home", "announcement", "faq", "seo"] as const;

type PageRow = {
  slug: string; title_en: string; title_ur: string; body_en: string; body_ur: string;
  seo_description_en: string; seo_description_ur: string; updated_at: Date;
};
const toPage = (row: PageRow) => ({
  slug: row.slug,
  title: { en: row.title_en, ur: row.title_ur },
  body: { en: row.body_en, ur: row.body_ur },
  seoDescription: { en: row.seo_description_en, ur: row.seo_description_ur },
  updatedAt: row.updated_at.toISOString(),
});

const pageInput = z.object({
  slug: slugRule,
  titleEn: z.string().trim().min(1).max(120),
  titleUr: z.string().trim().max(120),
  bodyEn: z.string().max(30_000),
  bodyUr: z.string().max(30_000),
  seoDescriptionEn: z.string().trim().max(170),
  seoDescriptionUr: z.string().trim().max(170),
});

export async function contentRoutes(app: FastifyInstance): Promise<void> {
  // ---------- Public ----------
  app.get("/v1/storefront", { preHandler: requireInternal }, async () => {
    const [store, home, announcement, faq, seo, pages] = await Promise.all([
      getSetting("store"), getSetting("home"), getSetting("announcement"), getSetting("faq"), getSetting("seo"),
      pool.query<{ slug: string; title_en: string; title_ur: string }>(`SELECT slug, title_en, title_ur FROM pages ORDER BY slug`),
    ]);
    return {
      store, home, announcement, faq, seo,
      pages: pages.rows.map((row) => ({ slug: row.slug, title: { en: row.title_en, ur: row.title_ur } })),
    };
  });

  app.get("/v1/pages/:slug", { preHandler: requireInternal }, async (request) => {
    const { slug } = parse(z.object({ slug: slugRule }), request.params);
    const result = await pool.query<PageRow>(`SELECT * FROM pages WHERE slug = $1`, [slug]);
    const row = result.rows[0];
    if (row === undefined) throw notFound("Page");
    return toPage(row);
  });

  app.get("/v1/sitemap", { preHandler: requireInternal }, async () => {
    const [products, categories, pages] = await Promise.all([
      pool.query<{ slug: string; updated_at: Date }>(
        `SELECT p.slug, p.updated_at FROM products p JOIN categories c ON c.id = p.category_id
         WHERE p.status = 'published' AND c.is_visible ORDER BY p.updated_at DESC LIMIT 20000`,
      ),
      pool.query<{ slug: string; updated_at: Date }>(`SELECT slug, updated_at FROM categories WHERE is_visible`),
      pool.query<{ slug: string; updated_at: Date }>(`SELECT slug, updated_at FROM pages`),
    ]);
    const map = (rows: Array<{ slug: string; updated_at: Date }>) => rows.map((row) => ({ slug: row.slug, updatedAt: row.updated_at.toISOString() }));
    return { products: map(products.rows), categories: map(categories.rows), pages: map(pages.rows) };
  });

  app.post("/v1/contact", { preHandler: requireInternal }, async (request, reply) => {
    const body = parse(
      z.object({
        name: z.string().trim().min(2).max(80),
        email: z.email().max(254),
        phone: z.string().trim().max(30).default(""),
        message: z.string().trim().min(10, "Please write a little more").max(3000),
      }),
      request.body,
    );
    await consume(`contact:${clientIp(request)}`, policies.contact);
    await pool.query(`INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4)`, [
      body.name, body.email.toLowerCase(), body.phone, body.message,
    ]);
    const store = await getSetting("store");
    if (store.email.length > 0) {
      await sendMail({
        to: store.email,
        subject: `New message from ${body.name}`,
        text: `${body.name} <${body.email}> ${body.phone}\n\n${body.message}`,
        html: emailLayout(htmlEscape(store.name.en), `<p><strong>${htmlEscape(body.name)}</strong> &lt;${htmlEscape(body.email)}&gt; ${htmlEscape(body.phone)}</p><p style="white-space:pre-wrap">${htmlEscape(body.message)}</p>`),
      });
    }
    return reply.status(201).send({ ok: true });
  });

  // ---------- Admin: settings ----------
  app.get("/v1/admin/settings/:key", { preHandler: requireReadyAdmin }, async (request) => {
    const { key } = parse(z.object({ key: z.enum([...EDITABLE, "smtp"]) }), request.params);
    if (key === "smtp") {
      const smtp = await getSetting("smtp");
      return { ...smtp, passEnc: "", passSet: smtp.passEnc.length > 0 };
    }
    return getSetting(key);
  });

  app.put("/v1/admin/settings/:key", { preHandler: requireReadyAdmin }, async (request) => {
    const { key } = parse(z.object({ key: z.enum(EDITABLE) }), request.params);
    const value = parse(settingSchemas[key], request.body);
    await saveSetting(key, value as never);
    await audit(getAdmin(request).id, "settings.updated", { key }, clientIp(request));
    return { ok: true };
  });

  app.put("/v1/admin/settings/smtp", { preHandler: requireReadyAdmin }, async (request) => {
    const input = parse(settingSchemas.smtp.omit({ passEnc: true }).extend({ pass: z.string().max(300) }), request.body);
    const current = await getSetting("smtp");
    const { pass, ...rest } = input;
    await saveSetting("smtp", { ...rest, passEnc: pass.length > 0 ? encryptSecret(pass) : current.passEnc });
    await audit(getAdmin(request).id, "settings.updated", { key: "smtp", passwordChanged: pass.length > 0 }, clientIp(request));
    return { ok: true };
  });

  app.post("/v1/admin/settings/smtp/test", { preHandler: requireReadyAdmin }, async (request) => {
    const result = await verifySmtp();
    if (!result.ok) return result;
    const admin = getAdmin(request);
    const sent = await sendMail({ to: admin.email, subject: "Test email", text: "Email settings work.", html: "<p>Email settings work.</p>" });
    return { ok: sent, message: sent ? `Test email sent to ${admin.email}` : "Connected, but sending failed" };
  });

  // ---------- Admin: pages ----------
  app.get("/v1/admin/pages", { preHandler: requireReadyAdmin }, async () => {
    const result = await pool.query<PageRow>(`SELECT * FROM pages ORDER BY slug`);
    return { items: result.rows.map(toPage) };
  });

  app.put("/v1/admin/pages/:slug", { preHandler: requireReadyAdmin }, async (request) => {
    const { slug } = parse(z.object({ slug: slugRule }), request.params);
    const input = parse(pageInput, request.body);
    try {
      await pool.query(
        `INSERT INTO pages (slug, title_en, title_ur, body_en, body_ur, seo_description_en, seo_description_ur)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (slug) DO UPDATE SET slug = $8, title_en = EXCLUDED.title_en, title_ur = EXCLUDED.title_ur,
           body_en = EXCLUDED.body_en, body_ur = EXCLUDED.body_ur, seo_description_en = EXCLUDED.seo_description_en,
           seo_description_ur = EXCLUDED.seo_description_ur`,
        [slug, input.titleEn, input.titleUr, input.bodyEn, input.bodyUr, input.seoDescriptionEn, input.seoDescriptionUr, input.slug],
      );
    } catch (error) {
      if (isUniqueViolation(error)) throw conflict("slug_taken", "Another page already uses this slug");
      throw error;
    }
    await audit(getAdmin(request).id, "page.saved", { slug: input.slug }, clientIp(request));
    return { slug: input.slug };
  });

  app.delete("/v1/admin/pages/:slug", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { slug } = parse(z.object({ slug: slugRule }), request.params);
    await pool.query(`DELETE FROM pages WHERE slug = $1`, [slug]);
    await audit(getAdmin(request).id, "page.deleted", { slug }, clientIp(request));
    return reply.status(204).send();
  });

  // ---------- Admin: inbox + audit ----------
  app.get("/v1/admin/messages", { preHandler: requireReadyAdmin }, async () => {
    const result = await pool.query(`SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100`);
    return { items: result.rows };
  });

  app.post("/v1/admin/messages/:id/read", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { id } = parse(z.object({ id: z.uuid() }), request.params);
    await pool.query(`UPDATE contact_messages SET is_read = TRUE WHERE id = $1`, [id]);
    return reply.status(204).send();
  });

  app.get("/v1/admin/audit", { preHandler: requireReadyAdmin }, async () => ({ items: await listAudit(100) }));
}
