-- Deduplicate display names before enforcing uniqueness.
WITH ranked AS (
  SELECT
    slug,
    name,
    ROW_NUMBER() OVER (
      PARTITION BY lower(trim(name))
      ORDER BY slug ASC
    ) AS rn
  FROM products
)
UPDATE products AS p
SET name = p.name || ' (' || p.slug || ')'
FROM ranked AS r
WHERE p.slug = r.slug
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS products_name_lower_unique
  ON products (lower(trim(name)));
