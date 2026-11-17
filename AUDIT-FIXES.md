# How the rebuild closes the audit findings (17 Nov 2026 audit of the old repo)

| ID | Old problem | Where it is fixed now |
|---|---|---|
| C1 | Order marked paid from the browser success URL | Only `markOrderPaid()` (`backend/src/features/payments/markPaid.ts`) can mark paid; called only after a PayFast `validation_hash` check, a JazzCash `pp_SecureHash` check + inquiry, or an Easypaisa inquiry (`hooks.routes.ts`). Browser return pages are read-only. |
| C2 | Client could mark any order failed | No client "markFailed". `markOrderFailed()` only moves `pending_payment`, never a paid order. |
| C3 | Client-supplied discount / total | Prices, sale prices and coupons computed server-side (`orders/pricing.ts`, `orders.service.ts`); DB `CHECK (total = subtotal - discount)` and `discount <= subtotal`. |
| C4 | Password reset with email only | Customers have no accounts. Admin reset = random token, stored hashed, 30-min single use, emailed; all sessions revoked; same response for unknown emails. |
| C5 | Published default admin credentials | No seed admin. First admin from `.env` only when the table is empty, forced password change, change-credentials screen, lockout, audit log. |
| H1 | Guest order access by order ID | Order page needs a 256-bit access token (hashed, expiring) kept in an httpOnly cookie or sent by email link. |
| H2 | Guessable 5-hex order IDs | `EMB-` + 10 Crockford-base32 chars (50 bits); UUID primary keys. |
| H3 | Every user had the BFF's IP | Next.js forwards nginx `X-Real-IP` in `x-client-ip`, trusted only with the internal key. nginx overwrites `X-Forwarded-For`. |
| H4 | DB write per request, before routing | Limits applied per route and operation (`platform/rateLimit.ts`), atomic single statement; hourly cleanup; nginx `limit_req` in front. |
| H5 | Sessions survive password change | Reset deletes all sessions; credential change deletes all others. |
| H6 | Admin could repoint payment URLs (SSRF) | Gateway endpoints are constants in `methodSpecs.ts`; only credentials are editable, encrypted at rest, changes audited. |
| H7 | ZIP as base64 in JSON | Signed 60-minute `/dl/` links streamed by the backend, download count enforced atomically; server action body limit 1 MB. |
| M1 | idempotencyKey ignored | Required `Idempotency-Key`, UNIQUE in DB + request hash; same key + different cart = 409. |
| M2 | Free-text payment status | `CHECK` on status/method, unique provider reference / transaction per method, guarded transitions with row lock. |
| M3 | Data fixes in migrations | Schema-only migrations with checksum ledger and advisory lock (`scripts/migrate.ts`). |
| M4 | Product delete broke on carts | Carts are client-side; products are archived, never deleted; order lines keep a snapshot. |
| M5 | No pagination / index | Paginated lists (max 48/100) with matching indexes. |
| M6 | Sessions/nonces never cleaned | `npm run cleanup` (sessions, tokens, buckets, orphan ZIPs, abandoned orders). |
| M7 | Malformed URL → 500 | Fastify client errors mapped to 4xx problem responses. |
| M8 | No unhandledRejection / shutdown timeout | Both in `server.ts`; structured logs with secrets redacted. |
| M9 | Uploads under `public/` | Files in `STORAGE_DIR` outside the app; nginx serves `/media/` WebP only. |
| M10 | Root PM2, `|| true`, no backups | Unprivileged user, scripts fail loudly, nightly verified backup, log rotation. |
| M11 | No tests | `backend/tests` (pricing, password hashing, encryption, gateway signatures, signed links, ZIP traversal). |
| L1–L9 | Dead code, >300-line files, 64 MB images, junk files, public repo data, stale docs, wrong customer IP, wildcard CSP, 28 MB action limit | Fresh codebase: every file ≤ 300 lines, images converted to sized WebP on upload, exact CSP `form-action` hosts, the shopper's IP (not the server's) sent to PayFast, 1 MB action limit, no secrets or test artefacts in the tree. |
