#!/usr/bin/env bash
# Nightly backup: database + uploaded files. Keeps 14 days locally.
# Copy the archive OFF the server too (rclone, another VPS, S3) — a backup on the
# same disk does not survive a disk failure.
#   crontab -e (as embroidery):  30 2 * * * /var/www/embroidery-store/deploy/backup.sh >> /var/log/embroidery/backup.log 2>&1
set -euo pipefail

BACKUP_DIR=/var/backups/embroidery
STORAGE_DIR=/var/lib/embroidery/storage
STAMP=$(date +%Y%m%d-%H%M)
set -a; source /var/www/embroidery-store/backend/.env; set +a

mkdir -p "$BACKUP_DIR"
pg_dump --format=custom --no-owner "$DATABASE_URL" > "$BACKUP_DIR/db-$STAMP.dump"
tar -C "$STORAGE_DIR" -czf "$BACKUP_DIR/files-$STAMP.tar.gz" media packages proofs

# Verify the dump is readable before deleting old ones.
pg_restore --list "$BACKUP_DIR/db-$STAMP.dump" > /dev/null
find "$BACKUP_DIR" -type f -mtime +14 -delete
echo "$(date -Is) backup ok: db-$STAMP.dump files-$STAMP.tar.gz"
