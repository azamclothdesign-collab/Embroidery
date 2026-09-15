import { pool } from "../../pool.js";

import { type ShopProduct } from "../../../../types/product.js";

type ProductRow = {
  slug: string;
  pdp_slug: string;
  name: string;
  category_id: string;
  rating: string;
  price_cents: number;
  hoop_size: string;
  stitch_count: number;
  badge: string;
  image_src: string;
  image_alt: string;
  stitched_image_src: string | null;
  stitched_image_alt: string | null;
  description: string | null;
  package_path: string | null;
  package_file_name: string | null;
  is_visible: boolean;
};

type FormatRow = {
  format_code: string;
};

function mapProductRow(row: ProductRow, formats: string[]): ShopProduct {
  const product: ShopProduct = {
    slug: row.slug,
    pdpSlug: row.pdp_slug,
    name: row.name,
    categoryId: row.category_id,
    rating: Number(row.rating),
    formats,
    priceCents: row.price_cents,
    hoopSize: row.hoop_size,
    stitchCount: row.stitch_count,
    badge: row.badge,
    imageSrc: row.image_src,
    imageAlt: row.image_alt,
  };

  if (row.stitched_image_src !== null) {
    product.stitchedImageSrc = row.stitched_image_src;
  }

  if (row.stitched_image_alt !== null) {
    product.stitchedImageAlt = row.stitched_image_alt;
  }

  if (row.description !== null && row.description.trim().length > 0) {
    product.description = row.description;
  }

  if (row.package_path !== null) {
    product.packagePath = row.package_path;
  }

  if (row.package_file_name !== null) {
    product.packageFileName = row.package_file_name;
  }

  product.isVisible = row.is_visible;

  return product;
}

async function loadFormatsBySlugs(
  slugs: readonly string[],
): Promise<Map<string, string[]>> {
  if (slugs.length === 0) {
    return new Map();
  }

  const result = await pool.query<FormatRow & { product_slug: string }>(
    `SELECT product_slug, format_code
     FROM product_formats
     WHERE product_slug = ANY($1::text[])
     ORDER BY format_code ASC`,
    [slugs],
  );

  const formatsBySlug = new Map<string, string[]>();

  for (const row of result.rows) {
    const current = formatsBySlug.get(row.product_slug) ?? [];
    current.push(row.format_code);
    formatsBySlug.set(row.product_slug, current);
  }

  return formatsBySlug;
}

export async function listProducts(): Promise<ShopProduct[]> {
  const result = await pool.query<ProductRow>(
    `SELECT slug, pdp_slug, name, category_id, rating, price_cents, hoop_size,
            stitch_count, badge, image_src, image_alt, stitched_image_src,
            stitched_image_alt, description, package_path, package_file_name,
            is_visible
     FROM products
     ORDER BY name ASC`,
  );

  const formatsBySlug = await loadFormatsBySlugs(
    result.rows.map((row) => row.slug),
  );

  return result.rows.map((row) =>
    mapProductRow(row, formatsBySlug.get(row.slug) ?? []),
  );
}

export async function findProductBySlug(
  slug: string,
): Promise<ShopProduct | null> {
  const result = await pool.query<ProductRow>(
    `SELECT slug, pdp_slug, name, category_id, rating, price_cents, hoop_size,
            stitch_count, badge, image_src, image_alt, stitched_image_src,
            stitched_image_alt, description, package_path, package_file_name,
            is_visible
     FROM products
     WHERE slug = $1 OR pdp_slug = $1`,
    [slug],
  );

  const row = result.rows[0];

  if (row === undefined) {
    return null;
  }

  const formatsBySlug = await loadFormatsBySlugs([row.slug]);
  return mapProductRow(row, formatsBySlug.get(row.slug) ?? []);
}

export async function insertProduct(input: {
  slug: string;
  pdpSlug: string;
  name: string;
  categoryId: string;
  rating: number;
  priceCents: number;
  hoopSize: string;
  stitchCount: number;
  badge: string;
  imageSrc: string;
  imageAlt: string;
  stitchedImageSrc?: string | undefined;
  stitchedImageAlt?: string | undefined;
  description?: string | undefined;
  formats: string[];
  packagePath?: string | undefined;
  packageFileName?: string | undefined;
  isVisible?: boolean | undefined;
}): Promise<ShopProduct> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO products (
         slug, pdp_slug, name, category_id, rating, price_cents, hoop_size,
         stitch_count, badge, image_src, image_alt, stitched_image_src,
         stitched_image_alt, description, package_path, package_file_name,
         is_visible
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        input.slug,
        input.pdpSlug,
        input.name,
        input.categoryId,
        input.rating,
        input.priceCents,
        input.hoopSize,
        input.stitchCount,
        input.badge,
        input.imageSrc,
        input.imageAlt,
        input.stitchedImageSrc ?? null,
        input.stitchedImageAlt ?? null,
        input.description ?? "",
        input.packagePath ?? null,
        input.packageFileName ?? null,
        input.isVisible ?? true,
      ],
    );

    for (const formatCode of input.formats) {
      await client.query(
        `INSERT INTO product_formats (product_slug, format_code)
         VALUES ($1, $2)`,
        [input.slug, formatCode],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const product = await findProductBySlug(input.slug);

  if (product === null) {
    throw new Error("product_insert_failed");
  }

  return product;
}

export async function updateProduct(
  slug: string,
  input: {
    pdpSlug: string;
    name: string;
    categoryId: string;
    rating: number;
    priceCents: number;
    hoopSize: string;
    stitchCount: number;
    badge: string;
    imageSrc: string;
    imageAlt: string;
    stitchedImageSrc?: string | undefined;
    stitchedImageAlt?: string | undefined;
    description?: string | undefined;
    formats: string[];
    packagePath?: string | undefined;
    packageFileName?: string | undefined;
    isVisible?: boolean | undefined;
  },
): Promise<ShopProduct | null> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updated = await client.query(
      `UPDATE products
       SET pdp_slug = $2,
           name = $3,
           category_id = $4,
           rating = $5,
           price_cents = $6,
           hoop_size = $7,
           stitch_count = $8,
           badge = $9,
           image_src = $10,
           image_alt = $11,
           stitched_image_src = $12,
           stitched_image_alt = $13,
           description = $14,
           package_path = COALESCE($15, package_path),
           package_file_name = COALESCE($16, package_file_name),
           is_visible = COALESCE($17, is_visible)
       WHERE slug = $1`,
      [
        slug,
        input.pdpSlug,
        input.name,
        input.categoryId,
        input.rating,
        input.priceCents,
        input.hoopSize,
        input.stitchCount,
        input.badge,
        input.imageSrc,
        input.imageAlt,
        input.stitchedImageSrc ?? null,
        input.stitchedImageAlt ?? null,
        input.description ?? "",
        input.packagePath ?? null,
        input.packageFileName ?? null,
        input.isVisible ?? null,
      ],
    );

    if (updated.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(`DELETE FROM product_formats WHERE product_slug = $1`, [
      slug,
    ]);

    for (const formatCode of input.formats) {
      await client.query(
        `INSERT INTO product_formats (product_slug, format_code)
         VALUES ($1, $2)`,
        [slug, formatCode],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return findProductBySlug(slug);
}

export async function deleteProduct(slug: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM products WHERE slug = $1`, [
    slug,
  ]);

  return (result.rowCount ?? 0) > 0;
}
