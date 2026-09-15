CREATE TABLE rate_limit_buckets (
  bucket_key TEXT PRIMARY KEY,
  tokens NUMERIC(12, 4) NOT NULL,
  capacity NUMERIC(12, 4) NOT NULL,
  refill_rate_per_second NUMERIC(12, 6) NOT NULL,
  last_refill_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX rate_limit_buckets_updated_at_idx ON rate_limit_buckets (updated_at);
