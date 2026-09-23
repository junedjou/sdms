#!/bin/bash

# ============================================================
#  SDMS - Backup Database + Upload ke Google Drive
#  Crontab: 0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1
# ============================================================

DB_USER="root"
DB_PASS=""                              # Isi jika ada password
DB_NAME="sdms_master"

BACKUP_DIR="/var/backups/sdms"
GDRIVE_FOLDER="gdrive:SDMS-Backup"

# Nama file TETAP — selalu menimpa file lama di Google Drive
FILE_BACKUP="${BACKUP_DIR}/backup_sdms_master.sql.gz"

# ── Buat folder backup jika belum ada ──────────────────────
mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ====== SDMS Backup dimulai ======"

# ── Backup database ────────────────────────────────────────
if [ -n "$DB_PASS" ]; then
    mariadb-dump --no-tablespaces --single-transaction \
      -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
      | gzip > "$FILE_BACKUP"
else
    mariadb-dump --no-tablespaces --single-transaction \
      -u "$DB_USER" "$DB_NAME" \
      | gzip > "$FILE_BACKUP"
fi

if [ $? -eq 0 ]; then
    SIZE=$(du -sh "$FILE_BACKUP" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup berhasil: $FILE_BACKUP ($SIZE)"

    # ── Upload ke Google Drive ─────────────────────────────
    rclone copyto "$FILE_BACKUP" "$GDRIVE_FOLDER/backup_sdms_master.sql.gz"

    if [ $? -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Upload Google Drive berhasil"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Upload Google Drive GAGAL"
        exit 2
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup GAGAL"
    exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ====== Selesai ======"
