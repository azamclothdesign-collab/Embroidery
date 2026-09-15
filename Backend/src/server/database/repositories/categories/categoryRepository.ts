import { pool } from "../../pool.js";

import { type CategoryRecord } from "../../../../types/product.js";

type CategoryRow = {
  id: string;
  label: string;
  sort_order: number;
  is_visible: boolean;
  image_src: string | null;
  image_alt: string | null;
};

function mapCategoryRow(row: CategoryRow): CategoryRecord {
  const category: CategoryRecord = {
    id: row.id,
    label: row.label,
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
  };

  if (row.image_src !== null) {
    category.imageSrc = row.image_src;
  }

  if (row.image_alt !== null) {
    category.imageAlt = row.image_alt;
  }

  return category;
}

const categorySelect = `id, label, sort_order, is_visible, image_src, image_alt`;

export async function listCategories(): Promise<CategoryRecord[]> {
  const result = await pool.query<CategoryRow>(
    `SELECT ${categorySelect}
     FROM categories
     ORDER BY sort_order ASC, label ASC`,
  );

  return result.rows.map(mapCategoryRow);
}

export async function findCategoryById(
  id: string,
): Promise<CategoryRecord | null> {
  const result = await pool.query<CategoryRow>(
    `SELECT ${categorySelect}
     FROM categories
     WHERE id = $1`,
    [id],
  );

  const row = result.rows[0];
  return row === undefined ? null : mapCategoryRow(row);
}

export async function insertCategory(
  input: CategoryRecord,
): Promise<CategoryRecord> {
  const result = await pool.query<CategoryRow>(
    `INSERT INTO categories (id, label, sort_order, is_visible, image_src, image_alt)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${categorySelect}`,
    [
      input.id,
      input.label,
      input.sortOrder,
      input.isVisible,
      input.imageSrc ?? null,
      input.imageAlt ?? null,
    ],
  );

  const row = result.rows[0];

  if (row === undefined) {
    throw new Error("category_insert_failed");
  }

  return mapCategoryRow(row);
}

export async function updateCategory(
  id: string,
  input: Omit<CategoryRecord, "id">,
): Promise<CategoryRecord | null> {
  const result = await pool.query<CategoryRow>(
    `UPDATE categories
     SET label = $2,
         sort_order = $3,
         is_visible = $4,
         image_src = COALESCE($5, image_src),
         image_alt = COALESCE($6, image_alt)
     WHERE id = $1
     RETURNING ${categorySelect}`,
    [
      id,
      input.label,
      input.sortOrder,
      input.isVisible,
      input.imageSrc ?? null,
      input.imageAlt ?? null,
    ],
  );

  const row = result.rows[0];
  return row === undefined ? null : mapCategoryRow(row);
}

export async function deleteCategory(id: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
