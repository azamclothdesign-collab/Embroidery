ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Existing storefront orders were created under the previous simulated checkout.
UPDATE orders
SET payment_status = 'paid',
    paid_at = COALESCE(paid_at, created_at)
WHERE payment_status = 'pending';
