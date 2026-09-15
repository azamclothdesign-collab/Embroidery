import "../src/loadEnv.js";

import process from "node:process";

import { findAdminByEmail } from "../src/server/database/repositories/auth/adminAuthRepository.js";
import { insertCategory } from "../src/server/database/repositories/categories/categoryRepository.js";
import { insertProduct } from "../src/server/database/repositories/products/productRepository.js";
import { pool } from "../src/server/database/pool.js";
import {
  createPasswordSalt,
  hashPassword,
} from "../src/utils/passwordHash.js";

import {
  seedAdmin,
  seedCategories,
  seedProducts,
} from "./catalogSeedData.js";

async function seedCatalog(): Promise<void> {
  const countResult = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM products",
  );
  const productCount = Number(countResult.rows[0]?.count ?? "0");

  if (productCount === 0) {
    for (const category of seedCategories) {
      await insertCategory(category);
    }

    for (const product of seedProducts) {
      await insertProduct(product);
    }

    process.stdout.write(
      `Seeded ${seedCategories.length} categories and ${seedProducts.length} products\n`,
    );
  } else {
    for (const product of seedProducts) {
      await pool.query(
        `UPDATE products
         SET description = $2
         WHERE slug = $1
           AND (description IS NULL OR btrim(description) = '')`,
        [product.slug, product.description],
      );
    }

    process.stdout.write(
      "Catalog already seeded; backfilled empty product descriptions\n",
    );
  }

  const existingAdmin = await findAdminByEmail(seedAdmin.email);

  if (existingAdmin === null) {
    const salt = createPasswordSalt();
    const passwordHash = await hashPassword(seedAdmin.password, salt);

    await pool.query(
      `INSERT INTO admin_users (email, password_hash, password_salt, role)
       VALUES ($1, $2, $3, 'admin')`,
      [seedAdmin.email, passwordHash, salt],
    );

    process.stdout.write(`Seeded admin user ${seedAdmin.email}\n`);
  } else {
    process.stdout.write("Admin user already exists, skipping\n");
  }
}

seedCatalog()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Seed failed";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
