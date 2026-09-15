CREATE TABLE auth_nonces (
  nonce TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX auth_nonces_expires_at_idx ON auth_nonces (expires_at);
