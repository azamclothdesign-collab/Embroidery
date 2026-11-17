-- Core schema for the embroidery design store.
-- gen_random_uuid() is built into PostgreSQL 13+ (no pgcrypto required).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- Admin ----------
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (email = lower(email) AND length(email) BETWEEN 3 AND 254),
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX admin_users_email_key ON admin_users (email);
CREATE TRIGGER admin_users_updated BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  ip TEXT NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX admin_sessions_admin_idx ON admin_sessions (admin_id);
CREATE INDEX admin_sessions_expiry_idx ON admin_sessions (expires_at);

CREATE TABLE admin_password_resets (
  token_hash TEXT PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX admin_password_resets_expiry_idx ON admin_password_resets (expires_at);

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX audit_log_created_idx ON audit_log (created_at DESC, id DESC);

-- ---------- Catalog ----------
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en TEXT NOT NULL CHECK (length(name_en) BETWEEN 1 AND 120),
  name_ur TEXT NOT NULL DEFAULT '',
  intro_en TEXT NOT NULL DEFAULT '',
  intro_ur TEXT NOT NULL DEFAULT '',
  seo_title_en TEXT NOT NULL DEFAULT '',
  seo_title_ur TEXT NOT NULL DEFAULT '',
  seo_description_en TEXT NOT NULL DEFAULT '',
  seo_description_ur TEXT NOT NULL DEFAULT '',
  image TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX categories_sort_idx ON categories (sort_order, name_en);
CREATE TRIGGER categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name_en TEXT NOT NULL CHECK (length(name_en) BETWEEN 1 AND 160),
  name_ur TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_ur TEXT NOT NULL DEFAULT '',
  price_minor INTEGER NOT NULL CHECK (price_minor >= 0),
  sale_price_minor INTEGER CHECK (sale_price_minor IS NULL OR (sale_price_minor >= 0 AND sale_price_minor < price_minor)),
  formats TEXT[] NOT NULL DEFAULT '{}',
  hoop_size TEXT NOT NULL DEFAULT '',
  stitch_count INTEGER NOT NULL DEFAULT 0 CHECK (stitch_count >= 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  package_path TEXT,
  package_name TEXT,
  package_size BIGINT CHECK (package_size IS NULL OR package_size > 0),
  package_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title_en TEXT NOT NULL DEFAULT '',
  seo_title_ur TEXT NOT NULL DEFAULT '',
  seo_description_en TEXT NOT NULL DEFAULT '',
  seo_description_ur TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'published' OR package_path IS NOT NULL)
);
CREATE INDEX products_category_idx ON products (category_id, status, published_at DESC, id);
CREATE INDEX products_listing_idx ON products (status, published_at DESC, id);
CREATE INDEX products_name_trgm_idx ON products USING gin (name_en gin_trgm_ops);
CREATE TRIGGER products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ZIP files uploaded by admin; attached to a product on save.
CREATE TABLE package_uploads (
  id UUID PRIMARY KEY,
  original_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (code = upper(code) AND code ~ '^[A-Z0-9_-]{3,32}$'),
  kind TEXT NOT NULL CHECK (kind IN ('percent', 'fixed')),
  value INTEGER NOT NULL CHECK (value > 0),
  min_subtotal_minor INTEGER NOT NULL DEFAULT 0 CHECK (min_subtotal_minor >= 0),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (kind <> 'percent' OR value <= 100),
  CHECK (max_uses IS NULL OR used_count <= max_uses)
);

-- ---------- Orders ----------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending_payment', 'awaiting_verification', 'paid', 'failed', 'cancelled', 'refunded')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('payfast', 'jazzcash', 'easypaisa', 'bank', 'cod')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL CHECK (customer_email = lower(customer_email)),
  customer_phone TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en' CHECK (locale IN ('en', 'ur')),
  subtotal_minor INTEGER NOT NULL CHECK (subtotal_minor >= 0),
  discount_minor INTEGER NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  total_minor INTEGER NOT NULL CHECK (total_minor >= 0),
  coupon_code TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL,
  provider_reference TEXT,
  provider_txn_id TEXT,
  client_ip TEXT NOT NULL DEFAULT '',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (discount_minor <= subtotal_minor),
  CHECK (total_minor = subtotal_minor - discount_minor),
  CHECK (status <> 'paid' OR paid_at IS NOT NULL)
);
CREATE UNIQUE INDEX orders_provider_txn_key ON orders (payment_method, provider_txn_id) WHERE provider_txn_id IS NOT NULL;
CREATE UNIQUE INDEX orders_provider_ref_key ON orders (payment_method, provider_reference) WHERE provider_reference IS NOT NULL;
CREATE INDEX orders_created_idx ON orders (created_at DESC, id DESC);
CREATE INDEX orders_status_idx ON orders (status, created_at DESC);
CREATE INDEX orders_email_idx ON orders (customer_email);
CREATE TRIGGER orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_slug TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ur TEXT NOT NULL DEFAULT '',
  image TEXT,
  price_minor INTEGER NOT NULL CHECK (price_minor >= 0),
  package_path TEXT NOT NULL,
  package_name TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0)
);
CREATE INDEX order_lines_order_idx ON order_lines (order_id);

CREATE TABLE order_access_tokens (
  token_hash TEXT PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX order_access_tokens_order_idx ON order_access_tokens (order_id);

CREATE TABLE payment_events (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  kind TEXT NOT NULL,
  event_key TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX payment_events_key ON payment_events (provider, event_key) WHERE event_key IS NOT NULL;
CREATE INDEX payment_events_order_idx ON payment_events (order_id, created_at DESC);

CREATE TABLE bank_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  transaction_ref TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX bank_proofs_order_idx ON bank_proofs (order_id, created_at DESC);

-- ---------- Payments config ----------
CREATE TABLE payment_methods (
  code TEXT PRIMARY KEY CHECK (code IN ('payfast', 'jazzcash', 'easypaisa', 'bank', 'cod')),
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mode TEXT NOT NULL DEFAULT 'sandbox' CHECK (mode IN ('sandbox', 'live')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  label_en TEXT NOT NULL,
  label_ur TEXT NOT NULL DEFAULT '',
  instructions_en TEXT NOT NULL DEFAULT '',
  instructions_ur TEXT NOT NULL DEFAULT '',
  config_enc TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER payment_methods_updated BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- Content ----------
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER settings_updated BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE pages (
  slug TEXT PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_en TEXT NOT NULL,
  title_ur TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  body_ur TEXT NOT NULL DEFAULT '',
  seo_description_en TEXT NOT NULL DEFAULT '',
  seo_description_ur TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER pages_updated BEFORE UPDATE ON pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX contact_messages_created_idx ON contact_messages (created_at DESC);

-- ---------- Abuse protection ----------
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  tokens DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX rate_limits_updated_idx ON rate_limits (updated_at);
