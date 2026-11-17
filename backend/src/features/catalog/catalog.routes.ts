import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { clientIp, parse, requireInternal } from "../../platform/http.ts";
import { consume, policies } from "../../platform/rateLimit.ts";
import { audit } from "../admin/audit.ts";
import { getAdmin, requireReadyAdmin } from "../admin/adminGuard.ts";
import { categoryInput, listQuery, productInput, slugRule } from "./catalog.schemas.ts";
import {
  createCategory,
  deleteCategory,
  findCategory,
  listCategories,
  reorderCategories,
  updateCategory,
} from "./categories.repo.ts";
import { archiveProduct, bulkStatus, deleteProduct, findProduct, listProducts, relatedProducts, saveProduct } from "./products.repo.ts";

const idParam = z.object({ id: z.uuid() });
const slugParam = z.object({ slug: slugRule });

export async function catalogRoutes(app: FastifyInstance): Promise<void> {
  // ---------- Public (called by the Next.js server) ----------
  app.get("/v1/categories", { preHandler: requireInternal }, async () => ({
    items: await listCategories({ includeHidden: false }),
  }));

  app.get("/v1/categories/:slug", { preHandler: requireInternal }, async (request) => {
    const { slug } = parse(slugParam, request.params);
    return findCategory({ slug }, false);
  });

  app.get("/v1/products", { preHandler: requireInternal }, async (request) => {
    const query = parse(listQuery, request.query);
    if (query.q !== undefined) await consume(`search:${clientIp(request)}`, policies.read);
    return listProducts(query, "public");
  });

  app.get("/v1/products/:slug", { preHandler: requireInternal }, async (request) => {
    const { slug } = parse(slugParam, request.params);
    const product = await findProduct({ slug }, "public");
    return { product, related: await relatedProducts(product, 4) };
  });

  // ---------- Admin ----------
  app.get("/v1/admin/categories", { preHandler: requireReadyAdmin }, async () => ({
    items: await listCategories({ includeHidden: true }),
  }));

  app.get("/v1/admin/categories/:id", { preHandler: requireReadyAdmin }, async (request) => {
    const { id } = parse(idParam, request.params);
    return findCategory({ id }, true);
  });

  app.post("/v1/admin/categories", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const input = parse(categoryInput, request.body);
    const id = await createCategory(input);
    await audit(getAdmin(request).id, "category.created", { id, slug: input.slug }, clientIp(request));
    return reply.status(201).send({ id });
  });

  app.put("/v1/admin/categories/:id", { preHandler: requireReadyAdmin }, async (request) => {
    const { id } = parse(idParam, request.params);
    const input = parse(categoryInput, request.body);
    await updateCategory(id, input);
    await audit(getAdmin(request).id, "category.updated", { id, slug: input.slug }, clientIp(request));
    return { id };
  });

  app.delete("/v1/admin/categories/:id", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { id } = parse(idParam, request.params);
    const result = await deleteCategory(id);
    await audit(getAdmin(request).id, "category.deleted", { id, deletedProducts: result.deletedProducts }, clientIp(request));
    return reply.status(204).send();
  });

  app.post("/v1/admin/categories/reorder", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { ids } = parse(z.object({ ids: z.array(z.uuid()).min(1).max(200) }), request.body);
    await reorderCategories(ids);
    return reply.status(204).send();
  });

  app.get("/v1/admin/products", { preHandler: requireReadyAdmin }, async (request) => {
    const query = parse(
      listQuery.extend({ status: z.enum(["draft", "published", "archived"]).optional() }),
      request.query,
    );
    return listProducts(query, "admin", query.status);
  });

  app.get("/v1/admin/products/:id", { preHandler: requireReadyAdmin }, async (request) => {
    const { id } = parse(idParam, request.params);
    return findProduct({ id }, "admin");
  });

  app.post("/v1/admin/products", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const input = parse(productInput, request.body);
    const id = await saveProduct(null, input);
    await audit(getAdmin(request).id, "product.created", { id, slug: input.slug }, clientIp(request));
    return reply.status(201).send({ id });
  });

  app.put("/v1/admin/products/:id", { preHandler: requireReadyAdmin }, async (request) => {
    const { id } = parse(idParam, request.params);
    const input = parse(productInput, request.body);
    await saveProduct(id, input);
    await audit(getAdmin(request).id, "product.updated", { id, slug: input.slug, status: input.status }, clientIp(request));
    return { id };
  });

  app.delete("/v1/admin/products/:id", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { id } = parse(idParam, request.params);
    await deleteProduct(id);
    await audit(getAdmin(request).id, "product.deleted", { id }, clientIp(request));
    return reply.status(204).send();
  });

  app.post("/v1/admin/products/:id/archive", { preHandler: requireReadyAdmin }, async (request, reply) => {
    const { id } = parse(idParam, request.params);
    await archiveProduct(id);
    await audit(getAdmin(request).id, "product.archived", { id }, clientIp(request));
    return reply.status(204).send();
  });

  app.post("/v1/admin/products/bulk", { preHandler: requireReadyAdmin }, async (request) => {
    const body = parse(
      z.object({ ids: z.array(z.uuid()).min(1).max(100), status: z.enum(["draft", "published", "archived"]) }),
      request.body,
    );
    const changed = await bulkStatus(body.ids, body.status);
    await audit(getAdmin(request).id, "product.bulk_status", { count: changed, status: body.status }, clientIp(request));
    return { changed };
  });
}
