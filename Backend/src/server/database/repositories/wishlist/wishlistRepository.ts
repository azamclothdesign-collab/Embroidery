import { pool } from "../../pool.js";

import { type WishlistItem } from "../../../../types/wishlist.js";

type WishlistRow = {
  product_slug: string;
  saved_at: Date;
};

function mapWishlistRow(row: WishlistRow): WishlistItem {
  return {
    slug: row.product_slug,
    savedAt: row.saved_at.toISOString(),
  };
}

export async function listWishlistItems(
  customerId: string,
): Promise<WishlistItem[]> {
  const result = await pool.query<WishlistRow>(
    `SELECT product_slug, saved_at
     FROM wishlist_items
     WHERE customer_id = $1
     ORDER BY saved_at DESC`,
    [customerId],
  );

  return result.rows.map(mapWishlistRow);
}

export async function replaceWishlistItems(input: {
  customerId: string;
  slugs: readonly string[];
}): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM wishlist_items WHERE customer_id = $1`, [
      input.customerId,
    ]);

    const now = new Date().toISOString();

    for (const slug of input.slugs) {
      await client.query(
        `INSERT INTO wishlist_items (customer_id, product_slug, saved_at)
         VALUES ($1, $2, $3)`,
        [input.customerId, slug, now],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
