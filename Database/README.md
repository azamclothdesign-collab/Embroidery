PostgreSQL schema and numbered forward-only SQL migrations.

Run:
- npm install
- copy .env.example to .env
- npm run migrate

Migrations:
- 0001_schema_migrations.sql
- 0002_auth_nonces.sql
- 0003_rate_limit_buckets.sql

Product tables ship in a later migration after schema approval.
