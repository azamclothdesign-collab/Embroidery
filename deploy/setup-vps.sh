#!/usr/bin/env bash
# One-time server preparation for Ubuntu 24.04 (Hostinger VPS). Run as root.
# Installs Node 24, PostgreSQL, nginx, certbot and creates an unprivileged app user.
# It does NOT create admin accounts or secrets — see README "First deploy".
set -euo pipefail

DOMAIN=embdesigens.com
APP_USER=embroidery
APP_DIR=/var/www/embroidery-store

apt-get update
apt-get install -y ca-certificates curl gnupg nginx postgresql certbot python3-certbot-nginx

# Node.js 24 from NodeSource's signed apt repository.
install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
apt-get update && apt-get install -y nodejs
npm install -g pm2@latest

id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash "$APP_USER"
install -d -o "$APP_USER" -g "$APP_USER" -m 0750 /var/lib/embroidery/storage /var/log/embroidery /var/backups/embroidery
install -d -o "$APP_USER" -g "$APP_USER" -m 0755 "$APP_DIR"
install -d -m 0755 /var/www/certbot
# nginx must read public images only.
chmod 0751 /var/lib/embroidery /var/lib/embroidery/storage
install -d -o "$APP_USER" -g www-data -m 0750 /var/lib/embroidery/storage/media

# Database + role (password printed once; put it in backend/.env).
DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'embroidery') THEN
    CREATE ROLE embroidery LOGIN PASSWORD '$DB_PASS';
  END IF;
END \$\$;
SELECT 'CREATE DATABASE embroidery OWNER embroidery' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'embroidery')\gexec
SQL

# TLS certificate (fails loudly if DNS is not pointing here yet).
certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" -d "www.$DOMAIN" --agree-tos --register-unsafely-without-email --non-interactive \
  || certbot certonly --nginx -d "$DOMAIN" -d "www.$DOMAIN" --agree-tos --register-unsafely-without-email --non-interactive

ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

echo
echo "Done. DATABASE_URL=postgres://embroidery:${DB_PASS}@127.0.0.1:5432/embroidery"
echo "Copy that into backend/.env now — it is not stored anywhere else."
