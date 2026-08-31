#!/bin/bash
# ============================================================
# Jalankan semua pending migration secara manual
# Usage: bash /var/www/sdms/deploy/run-migration.sh
# ============================================================

APP_DIR="/var/www/sdms"
MIGRATION_DIR="$APP_DIR/backend/migrations"
MIGRATION_DONE_FILE="$APP_DIR/.migrations_done"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC}  $1"; }
warn() { echo -e "${YELLOW}→${NC}  $1"; }
err()  { echo -e "${RED}✗${NC}  $1"; }

echo ""
echo "══ SDMS — Run Pending Migrations ══"
echo ""

touch "$MIGRATION_DONE_FILE"
RAN_MIGRATIONS=$(cat "$MIGRATION_DONE_FILE")
TOTAL=0; SKIPPED=0; FAILED=0

for migration_file in "$MIGRATION_DIR"/*.js; do
  migration_name=$(basename "$migration_file")
  if echo "$RAN_MIGRATIONS" | grep -qF "$migration_name"; then
    warn "Skip (sudah dijalankan): $migration_name"
    SKIPPED=$((SKIPPED + 1))
  else
    warn "Menjalankan: $migration_name ..."
    cd "$APP_DIR/backend"
    if node "$migration_file"; then
      echo "$migration_name" >> "$MIGRATION_DONE_FILE"
      ok "Selesai: $migration_name"
      TOTAL=$((TOTAL + 1))
    else
      err "Gagal: $migration_name"
      FAILED=$((FAILED + 1))
    fi
  fi
done

echo ""
echo "══ Hasil ══"
ok "$TOTAL migration dijalankan"
[ $SKIPPED -gt 0 ] && warn "$SKIPPED migration dilewati (sudah pernah jalan)"
[ $FAILED  -gt 0 ] && err  "$FAILED migration gagal"
echo ""

# Restart backend agar model Sequelize reload
if [ $TOTAL -gt 0 ]; then
  echo "→  Restart backend..."
  pm2 reload sdms-backend --update-env
  ok "Backend di-reload"
fi
