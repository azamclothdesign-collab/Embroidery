import { randomUUID } from "node:crypto";
import { copyFile, stat } from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import { pool } from "../platform/db.ts";
import { dirs, ensureStorage } from "../platform/storage.ts";
import { writeImageVariants } from "../features/media/images.ts";
import { inspectZip } from "../features/media/zipInspect.ts";

/**
 * One-time import from the old site (azamclothdesign-collab/Embroidery).
 *   LEGACY_DATABASE_URL=postgres://…old…  LEGACY_ROOT=/var/www/embroidery  npm run import:legacy
 * Copies categories + products (images re-encoded, ZIPs validated). Safe to re-run:
 * existing slugs are skipped. Products without a valid ZIP are imported as drafts.
 */
const legacyUrl = process.env.LEGACY_DATABASE_URL ?? "";
const legacyRoot = process.env.LEGACY_ROOT ?? "";

function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/^-+|-+$/g, "").slice(0, 80) || randomUUID().slice(0, 8);
}

async function importImage(src: string | null): Promise<string | null> {
  if (src === null || src.length === 0 || !src.startsWith("/")) return null;
  const file = path.join(legacyRoot, "Frontend/public", path.normalize(src).replace(/^(\.\.[/\\])+/, ""));
  try {
    return (await writeImageVariants(file, randomUUID())).base;
  } catch (error) {
    console.warn(`  image skipped (${src}): ${(error as Error).message}`);
    return null;
  }
}

async function importPackage(packagePath: string | null) {
  if (packagePath === null || packagePath.length === 0) return null;
  const candidates = path.isAbsolute(packagePath)
    ? [packagePath]
    : [path.join(legacyRoot, "storage/packages", path.basename(packagePath)), path.join(legacyRoot, packagePath)];
  for (const candidate of candidates) {
    const info = await stat(candidate).catch(() => null);
    if (info === null) continue;
    try {
      const report = await inspectZip(candidate);
      const id = randomUUID();
      await copyFile(candidate, path.join(dirs.packages, `${id}.zip`));
      return { path: `${id}.zip`, size: info.size, files: report.files.slice(0, 500) };
    } catch (error) {
      console.warn(`  zip rejected (${candidate}): ${(error as Error).message}`);
      return null;
    }
  }
  return null;
}

async function main(): Promise<void> {
  if (legacyUrl.length === 0 || legacyRoot.length === 0) throw new Error("Set LEGACY_DATABASE_URL and LEGACY_ROOT");
  await ensureStorage();
  const legacy = new pg.Client({ connectionString: legacyUrl });
  await legacy.connect();

  try {
    const categories = await legacy.query<{ id: string; label: string; sort_order: number; is_visible: boolean; image_src: string | null }>(
      `SELECT id, label, sort_order, is_visible, image_src FROM categories ORDER BY sort_order`,
    );
    const categoryMap = new Map<string, string>();
    for (const row of categories.rows) {
      const slug = slugify(row.id);
      const existing = await pool.query<{ id: string }>(`SELECT id FROM categories WHERE slug = $1`, [slug]);
      if (existing.rows[0] !== undefined) {
        categoryMap.set(row.id, existing.rows[0].id);
        continue;
      }
      const image = await importImage(row.image_src);
      const created = await pool.query<{ id: string }>(
        `INSERT INTO categories (slug, name_en, image, sort_order, is_visible) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [slug, row.label, image, row.sort_order, row.is_visible],
      );
      categoryMap.set(row.id, created.rows[0]?.id ?? "");
      console.log(`category ${slug}`);
    }

    const products = await legacy.query<{
      slug: string; name: string; category_id: string; price_cents: number; hoop_size: string; stitch_count: number;
      image_src: string; stitched_image_src: string | null; description: string; package_path: string | null;
      package_file_name: string | null; is_visible: boolean;
    }>(`SELECT * FROM products`);

    for (const row of products.rows) {
      const slug = slugify(row.slug);
      const categoryId = categoryMap.get(row.category_id);
      if (categoryId === undefined) continue;
      const exists = await pool.query(`SELECT 1 FROM products WHERE slug = $1`, [slug]);
      if ((exists.rowCount ?? 0) > 0) continue;

      const images = (await Promise.all([importImage(row.image_src), importImage(row.stitched_image_src)])).filter(
        (value): value is string => value !== null,
      );
      const pkg = await importPackage(row.package_path);
      const status = pkg !== null && row.is_visible ? "published" : "draft";
      await pool.query(
        `INSERT INTO products (slug, category_id, name_en, description_en, price_minor, formats, hoop_size, stitch_count,
           images, status, published_at, package_path, package_name, package_size, package_files)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, CASE WHEN $10 = 'published' THEN NOW() END, $11,$12,$13,$14::jsonb)`,
        [
          slug, categoryId, row.name, row.description, row.price_cents, ["DST", "PES", "JEF"], row.hoop_size, row.stitch_count,
          images, status, pkg?.path ?? null, pkg === null ? null : (row.package_file_name ?? `${slug}.zip`),
          pkg?.size ?? null, JSON.stringify(pkg?.files ?? []),
        ],
      );
      console.log(`product ${slug} (${status}${pkg === null ? ", no valid ZIP" : ""})`);
    }
  } finally {
    await legacy.end();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exitCode = 1;
});
