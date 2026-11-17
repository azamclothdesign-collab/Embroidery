# Embroidery Store — Next.js storefront + CMS + Fastify API

Client: **Chand Designer / embdesigens.com**. Minimal, bilingual (English + اردو) store for digital
embroidery designs: categories → design → cart → checkout (name, email, phone) → pay
(PayFast / JazzCash / Easypaisa / Bank transfer / Pay later) → instant ZIP download.

```
backend/    Fastify 5 + PostgreSQL API (Node 24, TypeScript run directly, no build step)
frontend/   Next.js 16 App Router storefront (/en, /ur) + admin CMS (/admin)
deploy/     nginx, PM2, VPS setup, nightly backup
```

> Yeh ZIP purane repo (`azamclothdesign-collab/Embroidery`) ko touch nahi karta. Naya code alag folder mein hai.
> Purana data (categories, designs, ZIPs) `npm run import:legacy` se laya ja sakta hai.

---

## 1. Local development

Requirements: Node ≥ 24, PostgreSQL ≥ 15.

```bash
# Database
createdb embroidery

# Backend
cd backend
cp .env.example .env            # fill DATABASE_URL, secrets (see below), STORAGE_DIR=./storage
npm install
npm run migrate
npm run dev                     # http://127.0.0.1:4000/health/ready

# Frontend (second terminal)
cd frontend
cp .env.example .env.local      # SITE_URL=http://localhost:3000, same INTERNAL_API_KEY
npm install
npm run dev                     # http://localhost:3000  → redirects to /en
```

Generate secrets:

```bash
openssl rand -base64 48   # INTERNAL_API_KEY (same value in backend/.env and frontend/.env.local)
openssl rand -base64 32   # SETTINGS_ENCRYPTION_KEY (exactly 32 bytes)
openssl rand -base64 48   # DOWNLOAD_SIGNING_KEY
```

For local dev set `NODE_ENV=development` and `SITE_URL=http://localhost:3000` in `backend/.env`
(production requires https).

### Checks

```bash
cd backend  && npm run typecheck && npm test
cd frontend && npm run lint && npm run typecheck && npm run build
```

---

## 2. First admin login (pehli dafa)

Koi default password code mein nahi hai. Pehla admin `.env` se banta hai:

```bash
# backend/.env
ADMIN_EMAIL=you@example.com
ADMIN_INITIAL_PASSWORD=Some-Long-Temp-Pass-2026
```

1. Backend restart karein → log: `First admin created; password change required`.
2. `/admin/login` par in credentials se login karein.
3. Aap **Account** page par force redirect honge — apna email aur naya password set karein.
   Iske baad hi baqi admin khulta hai. Doosre sab devices sign-out ho jate hain.
4. Ab `.env` se `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` hata dein (admin mojood ho to yeh ignore hote hain).

Password bhool jayein → `/admin/forgot` → email par 30 minute wala one-time link (SMTP zaroori).
5 ghalat koshishon par account 15 minute lock hota hai.

---

## 3. Payment methods (Admin → Payments)

Har method ka apna On/Off switch hai — koi bhi combination active kar sakte hain. Checkout par sirf
woh methods dikhte hain jo **on** hon aur jinki zaroori keys bhari hon.

| Method | Admin mein kya dalna hai | Confirm kaise hota hai |
|---|---|---|
| PayFast | Merchant ID, Merchant name, Secured key | PayFast ka signed callback (`validation_hash` with secured key) |
| JazzCash | Merchant ID, Password, Integrity salt | Signed return (`pp_SecureHash`) + Inquiry API |
| Easypaisa | Store ID, Hash key, Account no., API username/password | Inquire-transaction API |
| Bank transfer | Bank, title, account no., IBAN | Customer receipt upload → admin Approve |
| Pay later / COD | — | Admin "Mark as paid" |

- Keys DB mein **AES-256-GCM encrypted** hoti hain, dobara kabhi browser ko nahi bheji jatin.
- Gateway URLs code mein fixed hain (sandbox/live) — admin unhein kisi aur jagah point nahi kar sakta.
- Har card par **Callback URLs** dikhte hain — yeh merchant portal mein paste karein.
- "Test saved credentials" button provider se live jawab dikhata hai.
- Pehle **Sandbox** mein test karein, phir **Live**.
- Order kabhi browser redirect se paid nahi hota. Agar amount match na kare to order "review" mein rehta hai.
- Note: PayFast ko diye gaye business model mein "no COD" likha hai — COD sirf tab on karein jab client chahe.

> JazzCash/Easypaisa ke field names aur endpoints unke public integration guides ke mutabiq hain.
> Merchant account milne ke baad sandbox mein ek end-to-end test zaroor karein (README §6 checklist).

---

## 4. Production deploy (Hostinger VPS, Ubuntu 24.04)

```bash
# as root, once
bash deploy/setup-vps.sh                       # Node 24, PostgreSQL, nginx, certbot, app user, DB

# as the app user
sudo -iu embroidery
git clone <your-new-repo> /var/www/embroidery-store   # or upload this ZIP
cd /var/www/embroidery-store/backend  && cp .env.example .env && nano .env && npm ci && npm run migrate
cd ../frontend && cp .env.example .env.production && nano .env.production && npm ci && npm run build
pm2 start ../deploy/ecosystem.config.cjs && pm2 save
pm2 install pm2-logrotate

# as root
cp deploy/nginx/embdesigens.com.conf /etc/nginx/sites-available/
ln -s /etc/nginx/sites-available/embdesigens.com.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
pm2 startup systemd -u embroidery --hp /home/embroidery   # run the printed command
```

Cron (as `embroidery`):

```
0 * * * *  cd /var/www/embroidery-store/backend && npm run cleanup >> /var/log/embroidery/cleanup.log 2>&1
30 2 * * * /var/www/embroidery-store/deploy/backup.sh >> /var/log/embroidery/backup.log 2>&1
```

Backups ko server se bahar bhi copy karein (rclone / doosra server).

### Import from the old site

```bash
cd backend
LEGACY_DATABASE_URL=postgres://…old… LEGACY_ROOT=/var/www/embroidery npm run import:legacy
```

Categories + designs copy hote hain, images WebP mein convert, ZIPs validate. Jis design ka ZIP
valid na ho woh **Draft** mein aata hai. Dobara chalana safe hai (existing slugs skip).

---

## 5. Admin CMS — kya kya hai

Overview (sales chart, KPIs, top designs, pending tasks) · Orders (filters, search, CSV export, mark paid,
re-check with gateway, receipt approve/reject, resend link, reset downloads, refund/cancel, payment timeline) ·
Designs (inventory, bulk publish/unpublish/archive, bilingual fields, multi-image upload, ZIP upload with
progress + validation, SEO preview) · Categories · Coupons · Storefront (home heading/text, announcement strip,
FAQ, default SEO) · Pages (about/policies, bilingual) · Messages · Payments · Settings (store info, logo, socials,
download limit, SMTP + test email, activity log) · Account (change email/password).

---

## 6. Go-live checklist

- [ ] `backend/.env` has strong unique secrets; `NODE_ENV=production`; `SITE_URL=https://embdesigens.com`
- [ ] First admin created, password changed, `ADMIN_INITIAL_PASSWORD` removed from `.env`
- [ ] SMTP set in Admin → Settings → Email, test email received
- [ ] Each enabled gateway: sandbox payment → order turns **Paid** → ZIP downloads → email received
- [ ] Visiting `/hooks/payfast/return?basket_id=…&err_code=000` by hand does **not** mark an order paid
- [ ] Bank transfer: upload receipt → approve in admin → download unlocks
- [ ] Callback URLs pasted in every merchant portal; switch to **Live**; one small real payment
- [ ] `/sitemap.xml`, `/robots.txt`, `/llms.txt` load; Search Console + sitemap submitted
- [ ] Backups run and one restore tested
