import { pool } from "../../pool.js";

import { type CartLine } from "../../../../types/cart.js";

type CartRow = {
  product_slug: string;
  pdp_slug: string;
  name: string;
  price_cents: number;
  image_src: string;
  image_alt: string;
};

function mapCartRow(row: CartRow): CartLine {
  return {
    slug: row.product_slug,
    pdpSlug: row.pdp_slug,
    name: row.name,
    priceCents: row.price_cents,
    imageSrc: row.image_src,
    imageAlt: row.image_alt,
  };
}

export async function listCartLines(input: {
  customerId?: string;
  guestToken?: string;
}): Promise<CartLine[]> {
  if (input.customerId !== undefined) {
    const result = await pool.query<CartRow>(
      `SELECT p.slug AS product_slug, p.pdp_slug, p.name, p.price_cents,
              p.image_src, p.image_alt
       FROM cart_lines c
       INNER JOIN products p ON p.slug = c.product_slug
       WHERE c.customer_id = $1
       ORDER BY c.created_at ASC`,
      [input.customerId],
    );

    return result.rows.map(mapCartRow);
  }

  if (input.guestToken !== undefined) {
    const result = await pool.query<CartRow>(
      `SELECT p.slug AS product_slug, p.pdp_slug, p.name, p.price_cents,
              p.image_src, p.image_alt
       FROM cart_lines c
       INNER JOIN products p ON p.slug = c.product_slug
       WHERE c.guest_token = $1
       ORDER BY c.created_at ASC`,
      [input.guestToken],
    );

    return result.rows.map(mapCartRow);
  }

  return [];
}

export async function replaceCartLines(input: {
  customerId?: string;
  guestToken?: string;
  slugs: readonly string[];
}): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (input.customerId !== undefined) {
      await client.query(`DELETE FROM cart_lines WHERE customer_id = $1`, [
        input.customerId,
      ]);
    } else if (input.guestToken !== undefined) {
      await client.query(`DELETE FROM cart_lines WHERE guest_token = $1`, [
        input.guestToken,
      ]);
    }

    for (const slug of input.slugs) {
      if (input.customerId !== undefined) {
        await client.query(
          `INSERT INTO cart_lines (customer_id, product_slug)
           VALUES ($1, $2)`,
          [input.customerId, slug],
        );
      } else if (input.guestToken !== undefined) {
        await client.query(
          `INSERT INTO cart_lines (guest_token, product_slug)
           VALUES ($1, $2)`,
          [input.guestToken, slug],
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function mergeGuestCartToCustomer(input: {
  guestToken: string;
  customerId: string;
}): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const guestLines = await client.query<{ product_slug: string }>(
      `SELECT product_slug
       FROM cart_lines
       WHERE guest_token = $1`,
      [input.guestToken],
    );

    for (const row of guestLines.rows) {
      const existing = await client.query<{ product_slug: string }>(
        `SELECT product_slug
         FROM cart_lines
         WHERE customer_id = $1
           AND product_slug = $2`,
        [input.customerId, row.product_slug],
      );

      if ((existing.rowCount ?? 0) === 0) {
        await client.query(
          `INSERT INTO cart_lines (customer_id, product_slug)
           VALUES ($1, $2)`,
          [input.customerId, row.product_slug],
        );
      }
    }

    await client.query(`DELETE FROM cart_lines WHERE guest_token = $1`, [
      input.guestToken,
    ]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
