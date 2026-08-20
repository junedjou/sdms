#!/bin/bash
# ============================================================
# SDMS Hot Reload — Restart cepat tanpa git pull
#
# Usage:
#   bash deploy/hot-reload.sh           # Restart backend + reload nginx
#   bash deploy/hot-reload.sh --backend # Restart backend saja
#   bash deploy/hot-reload.sh --nginx   # Reload nginx saja
#   bash deploy/hot-reload.sh --rebuild # Rebuild frontend + restart
# ============================================================

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC}  $1"; }
err()  { echo -e "${RED}✗${NC}  $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC}  $1"; }
head() { echo -e "\n${CYAN}${BOLD}══ $1 ══${NC}"; }

APP_DIR="/var/www/sdms"
PM2_APP="sdms-backend"

# Parse args
DO_BACKEND=true; DO_NGINX=true; DO_REBUILD=false
for arg in "$@"; do
  case $arg in
    --backend) DO_NGINX=false ;;
    --nginx)   DO_BACKEND=false ;;
    --rebuild) DO_REBUILD=true ;;
  esac
done

echo -e "${CYAN}${BOLD}  SDMS — Quick Reload${NC}"
echo ""

[ -d "$APP_DIR" ] || err "Direktori $APP_DIR tidak ditemukan"
cd "$APP_DIR"

# Rebuild frontend
if [ "$DO_REBUILD" = true ]; then
  head "Build Frontend"
  cd "$APP_DIR/frontend"
  [ -d "node_modules" ] || npm install --silent
  npm run build
  ok "Frontend di-build"
  cd "$APP_DIR"
fi

# Restart backend
if [ "$DO_BACKEND" = true ]; then
  head "Restart Backend"
  if pm2 list 2>/dev/null | grep -q "$PM2_APP"; then
    pm2 reload "$PM2_APP" --update-env 2>&1 | tail -3 | sed 's/^/     /'
    ok "Backend di-reload"
  else
    pm2 start "$APP_DIR/ecosystem.config.js"
    ok "Backend dimulai"
  fi
  pm2 save --force > /dev/null 2>&1
fi

# Reload nginx
if [ "$DO_NGINX" = true ]; then
  head "Reload Nginx"
  nginx -t 2>&1 | sed 's/^/     /'
  systemctl reload nginx 2>/dev/null || true
  ok "Nginx di-reload"
fi

# Verify
head "Verifikasi"
sleep 2
HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"__hc__","password":"__hc__"}' \
  --max-time 3 2>/dev/null || echo "000")

if [ "$HTTP" = "401" ] || [ "$HTTP" = "200" ]; then
  ok "Backend merespons (HTTP $HTTP)"
else
  err "Backend tidak merespons (HTTP $HTTP) — cek: pm2 logs $PM2_APP --err"
fi

echo ""
echo -e "${GREEN}${BOLD}  ✓ Hot reload selesai!${NC}"
echo ""
