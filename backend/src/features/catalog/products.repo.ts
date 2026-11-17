import { readdir } from "node:fs/promises";
import path from "node:path";
import { isUniqueViolation, pool, withTransaction } from "../../platform/db.ts";
import { badRequest, conflict, notFound } from "../../platform/errors.ts";
import { dirs, removeQuietly, resolveInside } from "../../platform/storage.ts";
import { IMAGE_WIDTHS } from "../media/images.ts";
import type { ListQuery, ProductInput } from "./catalog.schemas.ts";

/** Removes /media/{id}-*.webp files for a stored public base path. */
export async function removeMediaBase(base: string | null | undefined): Promise<void> {
  if (base === null || base === undefined || !base.startsWith("/media/")) return;
  const id = path.basename(base);
  if (!/^[a-f0-9-]{36}$/i.test(id)) return;
  await Promise.all(IMAGE_WIDTHS.map((width) => removeQuietly(path.join(dirs.media, `${id}-${width}.webp`))));
  // Catch any leftover variants if widths change later.
  const files = await readdir(dirs.media).catch(() => [] as string[]);
  await Promise.all(files.filter((name) => name.startsWith(`${id}-`)).map((name) => removeQuietly(path.join(dirs.media, name))));
}

async function removeProductFiles(row: { package_path: string | null; images: string[] | null }): Promise<void> {
  if (row.package_path !== null) await removeQuietly(resolveInside(dirs.packages, row.package_path));
  for (const image of row.images ?? []) await removeMediaBase(image);
}

type Localized = { en: string; ur: string };

export type ProductDto = {
  id: string;
  slug: string;
  category: { id: string; slug: string; name: Localized };
  name: Localized;
  description: Localized;
  priceMinor: number;
  salePriceMinor: number | null;
  formats: string[];
  hoopSize: string;
  stitchCount: number;
  images: string[];
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  seoTitle: Localized;
  seoDescription: Localized;
  publishedAt: string | null;
  updatedAt: string;
  package: { id: string; name: string; size: number; files: string[] } | null;
};

type Row = {
  id: string;
  slug: string;
  category_id: string;
  category_slug: string;
  category_name_en: string;
  category_name_ur: string;
  name_en: string;
  name_ur: string;
  description_en: string;
  description_ur: string;
  price_minor: number;
  sale_price_minor: number | null;
  formats: string[];
  hoop_size: string;
  stitch_count: number;
  images: string[];
  status: ProductDto["status"];
  is_featured: boolean;
  seo_title_en: string;
  seo_title_ur: string;
  seo_description_en: string;
  seo_description_ur: string;
  published_at: Date | null;
  updated_at: Date;
  package_path: string | null;
  package_name: string | null;
  package_size: string | null;
  package_files: string[];
  total_count?: string;
};

const SELECT = `SELECT p.*, c.slug AS category_slug, c.name_en AS category_name_en, c.name_ur AS category_name_ur
  FROM products p JOIN categories c ON c.id = p.category_id`;

function toDto(row: Row, includePackageFiles: boolean): ProductDto {
  return {
    id: row.id,
    slug: row.slug,
    category: { id: row.category_id, slug: row.category_slug, name: { en: row.category_name_en, ur: row.category_name_ur } },
    name: { en: row.name_en, ur: row.name_ur },
    description: { en: row.description_en, ur: row.description_ur },
    priceMinor: row.price_minor,
    salePriceMinor: row.sale_price_minor,
    formats: row.formats,
    hoopSize: row.hoop_size,
    stitchCount: row.stitch_count,
    images: row.images,
    status: row.status,
    isFeatured: row.is_featured,
    seoTitle: { en: row.seo_title_en, ur: row.seo_title_ur },
    seoDescription: { en: row.seo_description_en, ur: row.seo_description_ur },
    publishedAt: row.published_at?.toISOString() ?? null,
    updatedAt: row.updated_at.toISOString(),
    package:
      row.package_path === null
        ? null
        : {
            id: row.package_path.replace(/\.zip$/, ""),
            name: row.package_name ?? "design.zip",
            size: Number(row.package_size ?? 0),
            files: includePackageFiles ? row.package_files : [],
          },
  };
}

const ORDER_BY: Record<ListQuery["sort"], string> = {
  new: "p.published_at DESC NULLS LAST, p.id DESC",
  price_asc: "COALESCE(p.sale_price_minor, p.price_minor) ASC, p.id",
  price_desc: "COALESCE(p.sale_price_minor, p.price_minor) DESC, p.id",
  name: "p.name_en ASC, p.id",
};

export type ProductPage = { items: ProductDto[]; total: number; page: number; pages: number };

export async function listProducts(query: ListQuery, scope: "public" | "admin", status?: string): Promise<ProductPage> {
  const where: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    where.push(sql.replace("?", `$${params.length}`));
  };

  if (scope === "public") where.push("p.status = 'published' AND c.is_visible");
  else if (status !== undefined) add("p.status = ?", status);
  if (query.category !== undefined) add("c.slug = ?", query.category);
  if (query.format !== undefined) add("? = ANY(p.formats)", query.format);
  if (query.onSale === "1") where.push("p.sale_price_minor IS NOT NULL");
  if (query.featured === "1") where.push("p.is_featured");
  if (query.q !== undefined && query.q.length > 0) {
    add("(p.name_en ILIKE ? OR p.name_ur ILIKE $" + (params.length + 1) + " OR p.slug ILIKE $" + (params.length + 1) + ")", `%${query.q.replaceAll(/[%_\\]/g, "")}%`);
  }

  params.push(query.limit, (query.page - 1) * query.limit);
  const result = await pool.query<Row>(
    `${SELECT.replace("SELECT p.*", "SELECT p.*, COUNT(*) OVER() AS total_count")}
     ${where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY ${ORDER_BY[query.sort]} LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  const total = Number(result.rows[0]?.total_count ?? 0);
  return {
    items: result.rows.map((row) => toDto(row, false)),
    total,
    page: query.page,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
}

export async function findProduct(by: { slug: string } | { id: string }, scope: "public" | "admin"): Promise<ProductDto> {
  const column = "slug" in by ? "p.slug" : "p.id";
  const visibility = scope === "public" ? "AND p.status = 'published' AND c.is_visible" : "";
  const result = await pool.query<Row>(`${SELECT} WHERE ${column} = $1 ${visibility}`, ["slug" in by ? by.slug : by.id]);
  const row = result.rows[0];
  if (row === undefined) throw notFound("Design");
  return toDto(row, scope === "admin");
}

export async function relatedProducts(product: ProductDto, limit: number): Promise<ProductDto[]> {
  const result = await pool.query<Row>(
    `${SELECT} WHERE p.status = 'published' AND c.is_visible AND p.category_id = $1 AND p.id <> $2
     ORDER BY p.published_at DESC NULLS LAST, p.id DESC LIMIT $3`,
    [product.category.id, product.id, limit],
  );
  return result.rows.map((row) => toDto(row, false));
}

/** Saves a product; attaches a staged ZIP when packageId changes. */
export async function saveProduct(id: string | null, input: ProductInput): Promise<string> {
  try {
    return await withTransaction(async (db) => {
      let pkg: { path: string; name: string; size: string; files: unknown } | null = null;
      if (input.packageId !== null) {
        const staged = await db.query<{ original_name: string; size_bytes: string; files: unknown }>(
          `SELECT original_name, size_bytes, files FROM package_uploads WHERE id = $1`,
          [input.packageId],
        );
        const row = staged.rows[0];
        if (row !== undefined) {
          pkg = { path: `${input.packageId}.zip`, name: row.original_name, size: row.size_bytes, files: row.files };
        } else if (id === null) {
          throw badRequest("package_missing", "Upload the ZIP file again", { packageId: "Upload not found" });
        }
      }
      if (input.status === "published" && input.packageId === null) {
        throw badRequest("package_required", "A ZIP file is required before publishing", { packageId: "Required" });
      }

      const common = [
        input.slug, input.categoryId, input.nameEn, input.nameUr, input.descriptionEn, input.descriptionUr,
        input.priceMinor, input.salePriceMinor, input.formats, input.hoopSize, input.stitchCount, input.images,
        input.status, input.isFeatured, input.seoTitleEn, input.seoTitleUr, input.seoDescriptionEn, input.seoDescriptionUr,
      ];

      let productId: string;
      if (id === null) {
        const created = await db.query<{ id: string }>(
          `INSERT INTO products (slug, category_id, name_en, name_ur, description_en, description_ur, price_minor,
             sale_price_minor, formats, hoop_size, stitch_count, images, status, is_featured, seo_title_en, seo_title_ur,
             seo_description_en, seo_description_ur, published_at, package_path, package_name, package_size, package_files)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
             CASE WHEN $13 = 'published' THEN NOW() END, $19, $20, $21, COALESCE($22::jsonb, '[]'::jsonb))
           RETURNING id`,
          [...common, pkg?.path ?? null, pkg?.name ?? null, pkg?.size ?? null, pkg === null ? null : JSON.stringify(pkg.files)],
        );
        productId = created.rows[0]?.id ?? "";
      } else {
        const updated = await db.query(
          `UPDATE products SET slug=$1, category_id=$2, name_en=$3, name_ur=$4, description_en=$5, description_ur=$6,
             price_minor=$7, sale_price_minor=$8, formats=$9, hoop_size=$10, stitch_count=$11, images=$12, status=$13,
             is_featured=$14, seo_title_en=$15, seo_title_ur=$16, seo_description_en=$17, seo_description_ur=$18,
             published_at = CASE WHEN $13 = 'published' THEN COALESCE(published_at, NOW()) ELSE published_at END,
             package_path = COALESCE($20, package_path), package_name = COALESCE($21, package_name),
             package_size = COALESCE($22, package_size), package_files = COALESCE($23::jsonb, package_files)
           WHERE id = $19`,
          [...common, id, pkg?.path ?? null, pkg?.name ?? null, pkg?.size ?? null, pkg === null ? null : JSON.stringify(pkg.files)],
        );
        if (updated.rowCount === 0) throw notFound("Design");
        productId = id;
      }
      if (pkg !== null) await db.query(`DELETE FROM package_uploads WHERE id = $1`, [input.packageId]);
      return productId;
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw conflict("slug_taken", "Another design already uses this URL slug");
    throw error;
  }
}

/** Soft-hide a design; past order download links keep working. */
export async function archiveProduct(id: string): Promise<void> {
  const result = await pool.query(`UPDATE products SET status = 'archived', is_featured = FALSE WHERE id = $1`, [id]);
  if (result.rowCount === 0) throw notFound("Design");
}

/**
 * Permanently removes a design and its package/images.
 * Order line snapshots keep working (product_id is SET NULL).
 */
export async function deleteProduct(id: string): Promise<void> {
  const existing = await pool.query<{ package_path: string | null; images: string[] }>(
    `SELECT package_path, images FROM products WHERE id = $1`,
    [id],
  );
  const row = existing.rows[0];
  if (row === undefined) throw notFound("Design");
  const deleted = await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
  if (deleted.rowCount === 0) throw notFound("Design");
  await removeProductFiles(row);
}

/** Hard-deletes every design in a category (files included). */
export async function deleteProductsInCategory(categoryId: string): Promise<number> {
  const rows = await pool.query<{ id: string; package_path: string | null; images: string[] }>(
    `SELECT id, package_path, images FROM products WHERE category_id = $1`,
    [categoryId],
  );
  if (rows.rows.length === 0) return 0;
  await pool.query(`DELETE FROM products WHERE category_id = $1`, [categoryId]);
  for (const row of rows.rows) await removeProductFiles(row);
  return rows.rows.length;
}

export async function bulkStatus(ids: string[], status: ProductDto["status"]): Promise<number> {
  const result = await pool.query(
    `UPDATE products SET status = $2,
       published_at = CASE WHEN $2 = 'published' THEN COALESCE(published_at, NOW()) ELSE published_at END
     WHERE id = ANY($1::uuid[]) AND ($2 <> 'published' OR package_path IS NOT NULL)`,
    [ids, status],
  );
  return result.rowCount ?? 0;
}
