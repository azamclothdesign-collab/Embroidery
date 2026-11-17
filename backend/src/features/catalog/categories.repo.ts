import { isUniqueViolation, pool } from "../../platform/db.ts";
import { conflict, notFound } from "../../platform/errors.ts";
import { deleteProductsInCategory, removeMediaBase } from "./products.repo.ts";
import type { CategoryInput } from "./catalog.schemas.ts";

type Localized = { en: string; ur: string };

export type CategoryDto = {
  id: string;
  slug: string;
  name: Localized;
  intro: Localized;
  seoTitle: Localized;
  seoDescription: Localized;
  image: string | null;
  sortOrder: number;
  isVisible: boolean;
  productCount: number;
  updatedAt: string;
};

type Row = {
  id: string;
  slug: string;
  name_en: string;
  name_ur: string;
  intro_en: string;
  intro_ur: string;
  seo_title_en: string;
  seo_title_ur: string;
  seo_description_en: string;
  seo_description_ur: string;
  image: string | null;
  sort_order: number;
  is_visible: boolean;
  product_count: number;
  updated_at: Date;
};

const COLUMNS = `c.id, c.slug, c.name_en, c.name_ur, c.intro_en, c.intro_ur, c.seo_title_en, c.seo_title_ur,
  c.seo_description_en, c.seo_description_ur, c.image, c.sort_order, c.is_visible, c.updated_at`;

function toDto(row: Row): CategoryDto {
  return {
    id: row.id,
    slug: row.slug,
    name: { en: row.name_en, ur: row.name_ur },
    intro: { en: row.intro_en, ur: row.intro_ur },
    seoTitle: { en: row.seo_title_en, ur: row.seo_title_ur },
    seoDescription: { en: row.seo_description_en, ur: row.seo_description_ur },
    image: row.image,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
    productCount: Number(row.product_count),
    updatedAt: row.updated_at.toISOString(),
  };
}

/** Public: visible categories with their published product counts. */
export async function listCategories(options: { includeHidden: boolean }): Promise<CategoryDto[]> {
  const countFilter = options.includeHidden ? "" : "AND p.status = 'published'";
  const result = await pool.query<Row>(
    `SELECT ${COLUMNS}, COUNT(p.id)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id ${countFilter}
     WHERE $1 OR c.is_visible
     GROUP BY c.id ORDER BY c.sort_order, c.name_en LIMIT 200`,
    [options.includeHidden],
  );
  return result.rows.map(toDto);
}

export async function findCategory(by: { slug: string } | { id: string }, includeHidden: boolean): Promise<CategoryDto> {
  const [column, value] = "slug" in by ? ["slug", by.slug] : ["id", by.id];
  const result = await pool.query<Row>(
    `SELECT ${COLUMNS},
       (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id AND p.status = 'published') AS product_count
     FROM categories c WHERE c.${column} = $1 AND ($2 OR c.is_visible)`,
    [value, includeHidden],
  );
  const row = result.rows[0];
  if (row === undefined) throw notFound("Category");
  return toDto(row);
}

function values(input: CategoryInput): unknown[] {
  return [
    input.slug,
    input.nameEn,
    input.nameUr,
    input.introEn,
    input.introUr,
    input.seoTitleEn,
    input.seoTitleUr,
    input.seoDescriptionEn,
    input.seoDescriptionUr,
    input.image,
    input.sortOrder,
    input.isVisible,
  ];
}

function mapWriteError(error: unknown): never {
  if (isUniqueViolation(error)) throw conflict("slug_taken", "Another category already uses this URL slug");
  throw error;
}

export async function createCategory(input: CategoryInput): Promise<string> {
  try {
    const result = await pool.query<{ id: string }>(
      `INSERT INTO categories (slug, name_en, name_ur, intro_en, intro_ur, seo_title_en, seo_title_ur,
         seo_description_en, seo_description_ur, image, sort_order, is_visible)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      values(input),
    );
    return result.rows[0]?.id ?? "";
  } catch (error) {
    return mapWriteError(error);
  }
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  try {
    const result = await pool.query(
      `UPDATE categories SET slug=$1, name_en=$2, name_ur=$3, intro_en=$4, intro_ur=$5, seo_title_en=$6,
         seo_title_ur=$7, seo_description_en=$8, seo_description_ur=$9, image=$10, sort_order=$11, is_visible=$12
       WHERE id = $13`,
      [...values(input), id],
    );
    if (result.rowCount === 0) throw notFound("Category");
  } catch (error) {
    mapWriteError(error);
  }
}

/** Deletes the category and every design inside it (including ZIP/image files). */
export async function deleteCategory(id: string): Promise<{ deletedProducts: number }> {
  const existing = await pool.query<{ image: string | null }>(`SELECT image FROM categories WHERE id = $1`, [id]);
  if (existing.rows[0] === undefined) throw notFound("Category");
  const deletedProducts = await deleteProductsInCategory(id);
  const result = await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
  if (result.rowCount === 0) throw notFound("Category");
  await removeMediaBase(existing.rows[0].image);
  return { deletedProducts };
}

export async function reorderCategories(ids: string[]): Promise<void> {
  await pool.query(
    `UPDATE categories c SET sort_order = o.position
     FROM unnest($1::uuid[]) WITH ORDINALITY AS o(id, position) WHERE c.id = o.id`,
    [ids],
  );
}
