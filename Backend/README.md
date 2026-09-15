Native Node.js HTTP API. Handlers live in src/server/api as one file per verb.

Run:
- npm install
- copy .env.example to .env and fill values
- npm run migrate (from Backend, applies Database/migrations)
- npm run dev

Frontend integration:
- Paths: Frontend/src/constants/apiRoutes.ts
- Client: Frontend/src/lib/api/apiClient.ts
- Envelope: shared shape in Frontend/src/types/apiEnvelope.ts and Backend/src/types/apiEnvelope.ts

Implemented:
- GET /health
- HMAC verification middleware (skippable per handler)
- PostgreSQL-backed rate limiting and nonce store
- Directory-based path resolver

Next handlers to add after product schema approval:
- products/list.ts, products/details.ts
- auth/register.ts, auth/login.ts
- orders/create.ts, orders/list.ts
