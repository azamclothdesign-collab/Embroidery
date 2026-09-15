#!/usr/bin/env bash
# Production bootstrap for embdesigns.com on Hostinger Ubuntu 24.04 VPS.
# Run as root: bash deploy/setup-vps.sh

set -euo pipefail

DOMAIN="embdesigns.com"
APP_DIR="/var/www/embroidery"
REPO_URL="https://github.com/azamclothdesign-collab/Embroidery.git"
NODE_MAJOR="24"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y curl ca-certificates gnupg ufw nginx certbot python3-certbot-nginx git build-essential

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

if ! command -v psql >/dev/null 2>&1; then
  apt-get install -y postgresql postgresql-contrib
  systemctl enable --now postgresql
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p "${APP_DIR}"
if [[ ! -d "${APP_DIR}/.git" ]]; then
  git clone "${REPO_URL}" "${APP_DIR}"
else
  git -C "${APP_DIR}" fetch origin
  git -C "${APP_DIR}" checkout main
  git -C "${APP_DIR}" pull --ff-only origin main
fi

DB_NAME="embroidery"
DB_USER="embroidery"
DB_PASS="$(openssl rand -hex 24)"
HMAC_SECRET="$(openssl rand -hex 32)"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}"

cat > "${APP_DIR}/Backend/.env" <<EOF
API_BASE_URL=https://${DOMAIN}
HMAC_SIGNING_SECRET=${HMAC_SECRET}
DATABASE_URL=${DATABASE_URL}
PORT=4000
ALLOWED_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}
NODE_ENV=production
EOF

cat > "${APP_DIR}/Database/.env" <<EOF
DATABASE_URL=${DATABASE_URL}
EOF

cat > "${APP_DIR}/Frontend/.env.local" <<EOF
API_BASE_URL=http://127.0.0.1:4000
HMAC_SIGNING_SECRET=${HMAC_SECRET}
APP_ORIGIN=https://${DOMAIN}
EOF

install -d -m 755 "${APP_DIR}/Frontend/public/uploads"
install -d -m 755 "${APP_DIR}/storage/packages"
chown -R www-data:www-data "${APP_DIR}/Frontend/public/uploads" "${APP_DIR}/storage/packages" || true

cd "${APP_DIR}/Database"
npm install
npm run migrate

cd "${APP_DIR}/Backend"
npm install
npm run seed || true

cd "${APP_DIR}/Frontend"
npm install
npm run build

cp "${APP_DIR}/deploy/nginx/embdesigns.com.conf" /etc/nginx/sites-available/embdesigns.com
ln -sfn /etc/nginx/sites-available/embdesigns.com /etc/nginx/sites-enabled/embdesigns.com
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

cd "${APP_DIR}/Backend"
pm2 delete embroidery-api >/dev/null 2>&1 || true
pm2 start npm --name embroidery-api -- start
cd "${APP_DIR}/Frontend"
pm2 delete embroidery-web >/dev/null 2>&1 || true
pm2 start npm --name embroidery-web -- start -- -p 3000
pm2 save
pm2 startup systemd -u root --hp /root | tail -n 1 | bash || true

certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos --register-unsafely-without-email --redirect || true

umask 077
cat > /root/embroidery-credentials.txt <<EOF
Domain: https://${DOMAIN}
Database URL: ${DATABASE_URL}
HMAC secret: ${HMAC_SECRET}
Admin seed (if seeded): admin@example.com / admin123
Change the admin password after first login.
EOF

echo "Setup complete."
echo "Credentials saved to /root/embroidery-credentials.txt"
echo "Confirm Spaceship DNS A @ -> this VPS IP, then wait for propagation."
