#!/bin/bash
# ============================================================
# Script ini dijalankan di VPS setelah upload manual via FTP/SCP
# Usage: bash /var/www/sdms/deploy/setup-after-upload.sh
# ============================================================

APP_DIR="/var/www/sdms"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${YELLOW}→${NC} $1"; }
head() { echo -e "\n${CYAN}${BOLD}=== $1 ===${NC}"; }

head "Install Dependencies Backend"
cd $APP_DIR/backend
npm install --omit=dev
ok "Backend dependencies terinstall"

head "Install & Build Frontend"
cd $APP_DIR/frontend
npm install
npm run build
ok "Frontend berhasil di-build"

head "Seed Data Awal"
cd $APP_DIR/backend
node seeds/run.js
ok "Data awal berhasil diisi"

head "Start/Restart Backend"
if pm2 list | grep -q "sdms-backend"; then
    pm2 restart sdms-backend
    ok "Backend di-restart"
else
    pm2 start $APP_DIR/ecosystem.config.js
    ok "Backend dimulai"
fi
pm2 save

head "Cek Status"
pm2 list | grep sdms
nginx -t && systemctl reload nginx
ok "Nginx di-reload"

echo ""
echo -e "${GREEN}${BOLD}Setup selesai! Website bisa diakses.${NC}"
