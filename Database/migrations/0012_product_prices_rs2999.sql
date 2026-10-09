-- Raise uniform catalog list price to Rs 2,999 (includes rows already set to Rs 1,499).
UPDATE products
SET price_cents = 299900
WHERE price_cents IN (499, 149900) OR price_cents <= 2500;
