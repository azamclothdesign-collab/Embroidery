import { createHash, randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { writeImageVariants } from "../features/media/images.ts";
import { inspectZip } from "../features/media/zipInspect.ts";
import { pool } from "../platform/db.ts";
import { dirs, ensureStorage } from "../platform/storage.ts";

/**
 * Seeds the new store from the old GitHub repo (azamclothdesign-collab/Embroidery).
 * The repo has category/product metadata + public images, but ZIPs/uploads are gitignored.
 * We attach a tiny placeholder ZIP so designs can be published for local browsing.
 *
 *   LEGACY_ROOT=C:\path\to\Embroidery-legacy  npm run import:repo
 */

const legacyRoot = process.env.LEGACY_ROOT ?? "";

const categories: { slug: string; label: string; image: string }[] = [
  { slug: "wilcom-embroidery-software", label: "Wilcom Embroidery Software", image: "cat_wilcom.jpg" },
  { slug: "embroidery-digitizing-course", label: "Embroidery Digitizing Course", image: "cat_course.jpg" },
  { slug: "step-by-step-embroidery-digitizing-guide", label: "Step-by-Step Embroidery Digitizing Guide in Urdu/Hindi", image: "cat_guide.jpg" },
  { slug: "cap-cart-embroidery", label: "Cap & Cart Embroidery Designs", image: "cat_cap_cart.jpg" },
  { slug: "anarkali-kurti-shirt-embroidery", label: "Anarkali, Kurti & Shirt Embroidery Design", image: "cat_anarkali.jpg" },
  { slug: "maxi-lehenga-embroidery", label: "Maxi & Lehenga Embroidery Designs", image: "cat_maxi.jpg" },
  { slug: "sherwani-embroidery", label: "Sherwani Embroidery Designs", image: "cat_sherwani.jpg" },
  { slug: "shawl-embroidery", label: "Shawl Embroidery Designs", image: "cat_shawl.jpg" },
  { slug: "neckline-embroidery", label: "Neckline Embroidery Designs", image: "cat_neckline.jpg" },
  { slug: "gala-daman-embroidery", label: "Gala Daman Embroidery Designs", image: "cat_gala_daman.jpg" },
  { slug: "gala-daman-sequins-embroidery", label: "Gala Daman Sequins Embroidery Designs", image: "cat_gala_daman_sequins.jpg" },
  { slug: "all-over-embroidery", label: "All-Over Embroidery Designs", image: "cat_all_over.jpg" },
  { slug: "motif-embroidery", label: "Motif Embroidery Designs", image: "cat_motif.jpg" },
  { slug: "velvet-embroidery", label: "Velvet Embroidery Designs", image: "cat_velvet.jpg" },
  { slug: "cotton-embroidery", label: "Cotton Embroidery Designs", image: "cat_cotton.jpg" },
  { slug: "shaneel-embroidery", label: "Shaneel Embroidery Designs", image: "cat_shaneel.jpg" },
  { slug: "aari-embroidery", label: "Aari Embroidery Designs", image: "cat_aari.jpg" },
  { slug: "dori-embroidery", label: "Dori Embroidery Designs", image: "cat_dori.jpg" },
  { slug: "fancy-lace-embroidery", label: "Fancy Lace Embroidery Designs", image: "cat_fancy_lace.jpg" },
  { slug: "sequins-embroidery", label: "Sequins Embroidery Designs", image: "cat_sequins.jpg" },
  { slug: "logo-embroidery", label: "Logo Embroidery Designs", image: "cat_logo.jpg" },
  { slug: "4-head-embroidery", label: "4-Head Embroidery Designs", image: "cat_4_head.jpg" },
  { slug: "2-head-3-head-embroidery", label: "2-Head & 3-Head Embroidery Designs", image: "cat_2_head_3_head.jpg" },
  { slug: "4-border-shawl", label: "4-Border Shawl Designs", image: "cat_4_border_shawl.jpg" },
  { slug: "islamic-embroidery", label: "Islamic Embroidery Designs", image: "cat_islamic.jpg" },
];

const products: {
  slug: string;
  name: string;
  categorySlug: string;
  priceMinor: number;
  image: string;
  featured?: boolean;
}[] = [
  { slug: "design-one", name: "Design One", categorySlug: "wilcom-embroidery-software", priceMinor: 299900, image: "designOne.jfif", featured: true },
  { slug: "design-two", name: "Design Two", categorySlug: "embroidery-digitizing-course", priceMinor: 299900, image: "designTwo.jpeg", featured: true },
  { slug: "design-three", name: "Design Three", categorySlug: "step-by-step-embroidery-digitizing-guide", priceMinor: 299900, image: "designThree.webp", featured: true },
  { slug: "design-four", name: "Design Four", categorySlug: "cap-cart-embroidery", priceMinor: 299900, image: "designFour.jfif", featured: true },
  { slug: "design-five", name: "Design Five", categorySlug: "anarkali-kurti-shirt-embroidery", priceMinor: 299900, image: "designFive.jfif", featured: true },
  { slug: "design-six", name: "Design Six", categorySlug: "maxi-lehenga-embroidery", priceMinor: 299900, image: "designSix.jfif", featured: true },
  { slug: "design-seven", name: "Design Seven", categorySlug: "sherwani-embroidery", priceMinor: 299900, image: "designSeven.jpg", featured: true },
  { slug: "design-eight", name: "Design Eight", categorySlug: "shawl-embroidery", priceMinor: 299900, image: "designEight.jpg", featured: true },
  { slug: "design-nine", name: "Design Nine", categorySlug: "neckline-embroidery", priceMinor: 299900, image: "designNine.jfif", featured: true },
  { slug: "design-ten", name: "Design Ten", categorySlug: "gala-daman-embroidery", priceMinor: 299900, image: "designTen.jpg", featured: true },
  { slug: "design-eleven", name: "Design Eleven", categorySlug: "gala-daman-sequins-embroidery", priceMinor: 299900, image: "designEleven.jfif", featured: true },
  { slug: "butter-radiance", name: "Butter Radiance", categorySlug: "all-over-embroidery", priceMinor: 299900, image: "butterRadiance.webp", featured: true },
  { slug: "iznik-maxi-frock", name: "Iznik Maxi Frock", categorySlug: "motif-embroidery", priceMinor: 299900, image: "iznikMaxiFrock.webp", featured: true },
  { slug: "sapphire-sun-azure", name: "Sapphire Sun Azure", categorySlug: "velvet-embroidery", priceMinor: 299900, image: "sapphireSunAzure.webp", featured: true },
  { slug: "whats-app-image", name: "WhatsApp Image", categorySlug: "cotton-embroidery", priceMinor: 299900, image: "whatsAppImage.jpeg" },
  { slug: "bd2506b", name: "BD 2506C", categorySlug: "shaneel-embroidery", priceMinor: 299900, image: "bd2506b.webp", featured: true },
  { slug: "images-two", name: "Images Two", categorySlug: "aari-embroidery", priceMinor: 299900, image: "imagesTwo.jfif" },
  { slug: "stardom-elaf-lime", name: "Stardom Elaf Lime", categorySlug: "dori-embroidery", priceMinor: 299900, image: "stardomElafLime.webp", featured: true },
  { slug: "stardom-elaf-glamorous", name: "Stardom Elaf Glamorous", categorySlug: "fancy-lace-embroidery", priceMinor: 299900, image: "stardomElafGlamorous.webp", featured: true },
];

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Minimal store-method ZIP (no compression) with the given files. */
function buildZip(entries: { name: string; data: Buffer }[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const crc = crc32(entry.data);
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(entry.data.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    name.copy(local, 30);
    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(entry.data.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);
    locals.push(local, entry.data);
    centrals.push(central);
    offset += local.length + entry.data.length;
  }
  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, centralDir, eocd]);
}

async function importImage(fileName: string): Promise<string | null> {
  const file = path.join(legacyRoot, "Frontend", "public", "assets", "images", fileName);
  if ((await stat(file).catch(() => null)) === null) {
    console.warn(`  image missing: ${fileName}`);
    return null;
  }
  try {
    return (await writeImageVariants(file, randomUUID())).base;
  } catch (error) {
    console.warn(`  image skipped (${fileName}): ${(error as Error).message}`);
    return null;
  }
}

async function placeholderPackage(slug: string): Promise<{ path: string; size: number; files: string[]; name: string }> {
  await mkdir(dirs.tmp, { recursive: true });
  const id = randomUUID();
  const tmp = path.join(dirs.tmp, `${id}.zip`);
  const zip = buildZip([
    { name: `${slug}.dst`, data: Buffer.from(`PLACEHOLDER DST for ${slug}\n`) },
    { name: `${slug}.pes`, data: Buffer.from(`PLACEHOLDER PES for ${slug}\n`) },
    { name: "README.txt", data: Buffer.from("Placeholder package for local preview. Replace with the real embroidery ZIP from production storage.\n") },
  ]);
  await writeFile(tmp, zip);
  const report = await inspectZip(tmp);
  const destName = `${id}.zip`;
  await copyFile(tmp, path.join(dirs.packages, destName));
  return { path: destName, size: zip.length, files: report.files, name: `${slug}.zip` };
}

async function main(): Promise<void> {
  if (legacyRoot.length === 0) throw new Error("Set LEGACY_ROOT to the cloned Embroidery repo path");
  await ensureStorage();

  const categoryIds = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const existing = await pool.query<{ id: string }>(`SELECT id FROM categories WHERE slug = $1`, [category.slug]);
    if (existing.rows[0] !== undefined) {
      categoryIds.set(category.slug, existing.rows[0].id);
      console.log(`category skip ${category.slug}`);
      continue;
    }
    const image = await importImage(category.image);
    const created = await pool.query<{ id: string }>(
      `INSERT INTO categories (slug, name_en, image, sort_order, is_visible)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING id`,
      [category.slug, category.label, image, index + 1],
    );
    categoryIds.set(category.slug, created.rows[0]?.id ?? "");
    console.log(`category ${category.slug}`);
  }

  for (const product of products) {
    const exists = await pool.query(`SELECT 1 FROM products WHERE slug = $1`, [product.slug]);
    if ((exists.rowCount ?? 0) > 0) {
      console.log(`product skip ${product.slug}`);
      continue;
    }
    const categoryId = categoryIds.get(product.categorySlug);
    if (categoryId === undefined || categoryId.length === 0) {
      console.warn(`product skipped (no category): ${product.slug}`);
      continue;
    }
    const image = await importImage(product.image);
    const images = image === null ? [] : [image];
    const pkg = await placeholderPackage(product.slug);
    await pool.query(
      `INSERT INTO products (
         slug, category_id, name_en, description_en, price_minor, formats, hoop_size, stitch_count,
         images, status, is_featured, published_at, package_path, package_name, package_size, package_files
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,'published',$10,NOW(),$11,$12,$13,$14::jsonb
       )`,
      [
        product.slug,
        categoryId,
        product.name,
        "Professionally digitized machine embroidery design. Instant ZIP download after payment.",
        product.priceMinor,
        ["DST", "PES", "JEF", "EXP", "VP3"],
        '4 × 4"',
        0,
        images,
        product.featured === true,
        pkg.path,
        pkg.name,
        pkg.size,
        JSON.stringify(pkg.files),
      ],
    );
    console.log(`product ${product.slug}`);
  }

  const digest = createHash("sha256").update(JSON.stringify({ categories: categories.length, products: products.length })).digest("hex").slice(0, 12);
  console.log(`Import complete (${digest}). Placeholder ZIPs only — replace from production storage for real downloads.`);
}

main()
  .catch((error: unknown) => {
    console.error((error as Error).message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
