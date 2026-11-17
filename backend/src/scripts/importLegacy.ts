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

/** Old DB left many category.image_src blank; files still live under assets/images. */
const categoryImageFallbacks: Record<string, string> = {
  "wilcom-embroidery-software": "cat_wilcom.jpg",
  "embroidery-digitizing-course": "cat_course.jpg",
  "step-by-step-embroidery-digitizing-guide": "cat_guide.jpg",
  "cap-cart-embroidery": "cat_cap_cart.jpg",
  "anarkali-kurti-shirt-embroidery": "cat_anarkali.jpg",
  "maxi-lehenga-embroidery": "cat_maxi.jpg",
  "sherwani-embroidery": "cat_sherwani.jpg",
  "shawl-embroidery": "cat_shawl.jpg",
  "neckline-embroidery": "cat_neckline.jpg",
  "gala-daman-embroidery": "cat_gala_daman.jpg",
  "gala-daman-sequins-embroidery": "cat_gala_daman_sequins.jpg",
  "all-over-embroidery": "cat_all_over.jpg",
  "motif-embroidery": "cat_motif.jpg",
  "velvet-embroidery": "cat_velvet.jpg",
  "cotton-embroidery": "cat_cotton.jpg",
  "shaneel-embroidery": "cat_shaneel.jpg",
  "aari-embroidery": "cat_aari.jpg",
  "dori-embroidery": "cat_dori.jpg",
  "fancy-lace-embroidery": "cat_fancy_lace.jpg",
  "sequins-embroidery": "cat_sequins.jpg",
  "logo-embroidery": "cat_logo.jpg",
  "4-head-embroidery": "cat_4_head.jpg",
  "2-head-3-head-embroidery": "cat_2_head_3_head.jpg",
  "4-border-shawl": "cat_4_border_shawl.jpg",
  "islamic-embroidery": "cat_islamic.jpg",
};

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFKD")
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/^-+|-+$/g, "")
      .slice(0, 80) || randomUUID().slice(0, 8)
  );
}

function imageCandidates(src: string): string[] {
  const normalized = path.normalize(src).replace(/^(\.\.[/\\])+/, "");
  const bare = normalized.replace(/^[/\\]+/, "");
  const base = path.basename(bare);
  return [
    path.isAbsolute(normalized) ? normalized : "",
    path.join(legacyRoot, "Frontend/public", bare),
    path.join(legacyRoot, "Frontend/public", normalized),
    path.join(legacyRoot, "Frontend/public/uploads", base),
    path.join(legacyRoot, "Frontend/public/assets/images", base),
    path.join(legacyRoot, "storage/uploads", base),
    path.join(legacyRoot, "storage/media", base),
    path.join(legacyRoot, bare),
    path.join(legacyRoot, normalized),
  ].filter((value, index, all) => value.length > 0 && all.indexOf(value) === index);
}

function packageCandidates(packagePath: string): string[] {
  const base = path.basename(packagePath);
  return [
    path.isAbsolute(packagePath) ? packagePath : "",
    path.join(legacyRoot, "storage/packages", base),
    path.join(legacyRoot, "Backend/storage/packages", base),
    path.join(legacyRoot, packagePath),
    path.join(legacyRoot, "storage", base),
  ].filter((value, index, all) => value.length > 0 && all.indexOf(value) === index);
}

async function firstExisting(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    const info = await stat(candidate).catch(() => null);
    if (info?.isFile()) return candidate;
  }
  return null;
}

async function importImage(src: string | null, label: string): Promise<string | null> {
  if (src === null || src.trim().length === 0) {
    console.warn(`  image missing src (${label})`);
    return null;
  }

  const file = await firstExisting(imageCandidates(src));
  if (file === null) {
    console.warn(`  image file not found (${label}): ${src}`);
    return null;
  }

  try {
    return (await writeImageVariants(file, randomUUID(), { allowUpscale: true })).base;
  } catch (error) {
    console.warn(`  image skipped (${label} → ${file}): ${(error as Error).message}`);
    return null;
  }
}

async function importPackage(packagePath: string | null) {
  if (packagePath === null || packagePath.length === 0) return null;

  const candidate = await firstExisting(packageCandidates(packagePath));
  if (candidate === null) {
    console.warn(`  zip not found: ${packagePath}`);
    return null;
  }

  try {
    const report = await inspectZip(candidate);
    const info = await stat(candidate);
    const id = randomUUID();
    await copyFile(candidate, path.join(dirs.packages, `${id}.zip`));
    return { path: `${id}.zip`, size: info.size, files: report.files.slice(0, 500) };
  } catch (error) {
    console.warn(`  zip rejected (${candidate}): ${(error as Error).message}`);
    return null;
  }
}

async function main(): Promise<void> {
  if (legacyUrl.length === 0 || legacyRoot.length === 0) {
    throw new Error("Set LEGACY_DATABASE_URL and LEGACY_ROOT");
  }
  await ensureStorage();
  const legacy = new pg.Client({ connectionString: legacyUrl });
  await legacy.connect();

  try {
    const categories = await legacy.query<{
      id: string;
      label: string;
      sort_order: number;
      is_visible: boolean;
      image_src: string | null;
    }>(`SELECT id, label, sort_order, is_visible, image_src FROM categories ORDER BY sort_order`);

    console.log(`legacy categories: ${categories.rowCount ?? 0}`);
    const categoryMap = new Map<string, string>();

    for (const row of categories.rows) {
      const slug = slugify(row.id);
      const existing = await pool.query<{ id: string }>(
        `SELECT id FROM categories WHERE slug = $1`,
        [slug],
      );
      if (existing.rows[0] !== undefined) {
        categoryMap.set(row.id, existing.rows[0].id);
        console.log(`category ${slug} (exists)`);
        continue;
      }

      let image = await importImage(row.image_src, `category:${slug}`);
      if (image === null) {
        const fallback = categoryImageFallbacks[slug];
        if (fallback !== undefined) {
          image = await importImage(
            `/assets/images/${fallback}`,
            `category:${slug}:fallback`,
          );
        }
      }
      const created = await pool.query<{ id: string }>(
        `INSERT INTO categories (slug, name_en, image, sort_order, is_visible)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [slug, row.label, image, row.sort_order, row.is_visible],
      );
      categoryMap.set(row.id, created.rows[0]?.id ?? "");
      console.log(`category ${slug} (image=${image === null ? "none" : "ok"})`);
    }

    const products = await legacy.query<{
      slug: string;
      name: string;
      category_id: string;
      price_cents: number;
      hoop_size: string;
      stitch_count: number;
      image_src: string;
      stitched_image_src: string | null;
      description: string;
      package_path: string | null;
      package_file_name: string | null;
      is_visible: boolean;
    }>(`SELECT * FROM products`);

    console.log(`legacy products: ${products.rowCount ?? 0}`);

    for (const row of products.rows) {
      const slug = slugify(row.slug);
      const categoryId = categoryMap.get(row.category_id);
      if (categoryId === undefined) {
        console.warn(`product ${slug} skipped (unknown category ${row.category_id})`);
        continue;
      }

      const exists = await pool.query(`SELECT 1 FROM products WHERE slug = $1`, [slug]);
      if ((exists.rowCount ?? 0) > 0) {
        console.log(`product ${slug} (exists)`);
        continue;
      }

      const images = (
        await Promise.all([
          importImage(row.image_src, `product:${slug}`),
          importImage(row.stitched_image_src, `product:${slug}:stitched`),
        ])
      ).filter((value): value is string => value !== null);

      const pkg = await importPackage(row.package_path);
      const status = pkg !== null && row.is_visible ? "published" : "draft";

      await pool.query(
        `INSERT INTO products (
           slug, category_id, name_en, description_en, price_minor, formats, hoop_size, stitch_count,
           images, status, published_at, package_path, package_name, package_size, package_files
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
           CASE WHEN $10 = 'published' THEN NOW() END,
           $11,$12,$13,$14::jsonb
         )`,
        [
          slug,
          categoryId,
          row.name,
          row.description,
          row.price_cents,
          ["DST", "PES", "JEF"],
          row.hoop_size,
          row.stitch_count,
          images,
          status,
          pkg?.path ?? null,
          pkg === null ? null : (row.package_file_name ?? `${slug}.zip`),
          pkg?.size ?? null,
          JSON.stringify(pkg?.files ?? []),
        ],
      );
      console.log(
        `product ${slug} (${status}, images=${images.length}${pkg === null ? ", no valid ZIP" : ", zip=ok"})`,
      );
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
