-- PayFast KYC: replace token USD-style amounts (Rs 4.99) with PKR list prices.
UPDATE products
SET price_cents = 149900
WHERE price_cents <= 2500;
