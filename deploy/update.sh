#!/bin/bash
# ============================================================
# SDMS Update Script — Jalankan di VPS setiap ada update kode
#
# Usage:
#   bash /var/www/sdms/deploy/update.sh
#   bash /var/www/sdms/deploy/update.sh --skip-build
#   bash /var/www/sdms/deploy/update.sh --seed
# ============================================================

set -e

# ── Warna ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC}  $1"; }
err()  { echo -e "${RED}✗${NC}  $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC}  $1"; }
warn() { echo -e "${YELLOW}⚠${NC}  $1"; }
head() { echo -e "\n${CYAN}${BOLD}══ $1 ══${NC}"; }

# ── Konfigurasi ──────────────────────────────────────────────
APP_DIR="/var/www/sdms"
BRANCH="main"
PM2_APP="sdms-backend"
NGINX_CONF="/etc/nginx/sites-available/sdms"

# ── Parse argumen ────────────────────────────────────────────
SKIP_BUILD=false
RUN_SEED=false
for arg in "$@"; do
  case $arg in
    --skip-build) SKIP_BUILD=true ;;
    --seed)       RUN_SEED=true ;;
  esac
done

# ── Banner ───────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}"
echo "  ╔══════════════════════════════════╗"
echo "  ║   SDMS — VPS Update Script       ║"
echo "  ╚══════════════════════════════════╝"
echo -e "${NC}"

[ -d "$APP_DIR" ] || err "Direktori $APP_DIR tidak ditemukan."
[ -d "$APP_DIR/.git" ] || err "Bukan git repository. Lakukan git clone dulu."
cd "$APP_DIR"

# ── STEP 0: Auto-fix Nginx jika ada duplikat (jalankan tiap kali) ──
head "Cek & Fix Nginx Config"
TIMEOUT_COUNT=$(grep -c "proxy_read_timeout" "$NGINX_CONF" 2>/dev/null || echo "0")
if [ "$TIMEOUT_COUNT" -gt "1" ]; then
  warn "Ditemukan proxy_read_timeout duplikat ($TIMEOUT_COUNT baris) — auto-fix..."
  # Tulis ulang config Nginx yang bersih
  cat > "$NGINX_CONF" << 'NGINXCONF'
server {
    listen 80;
    server_name sdms.smkn1kras.sch.id www.sdms.smkn1kras.sch.id;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    location / {
        root /var/www/sdms/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        location ~* \.(js|css|png|jpg|jpeg|svg|ico|woff2?)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        client_max_body_size 10M;
    }

    access_log /var/log/nginx/sdms.access.log;
    error_log  /var/log/nginx/sdms.error.log;
}
NGINXCONF
  ok "Nginx config ditulis ulang (bersih)"
  nginx -t && systemctl reload nginx
  ok "Nginx di-reload"
else
  ok "Nginx config OK (tidak ada duplikat)"
fi

# Pastikan Nginx berjalan
if ! systemctl is-active --quiet nginx; then
  warn "Nginx tidak berjalan — mencoba start..."
  systemctl start nginx
  ok "Nginx distart"
fi

# ── STEP 1: Git pull ─────────────────────────────────────────
head "Git Pull dari GitHub"
BEFORE=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

if ! git diff --quiet 2>/dev/null; then
  info "Ada perubahan lokal — disimpan (git stash)..."
  git stash push -m "auto-stash $(date '+%Y%m%d-%H%M%S')" 2>/dev/null || true
fi

git fetch origin "$BRANCH"
git reset --hard "origin/${BRANCH}"
AFTER=$(git rev-parse --short HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
  ok "Sudah up-to-date (HEAD: ${AFTER})"
else
  ok "Update: ${BEFORE} → ${AFTER}"
  git log --oneline "${BEFORE}..${AFTER}" 2>/dev/null | head -8 | sed 's/^/     /'
fi

# ── STEP 2: Deteksi perubahan ────────────────────────────────
BACKEND_CHANGED=false; FRONTEND_CHANGED=false
DEPS_BACKEND_CHANGED=false; DEPS_FRONTEND_CHANGED=false
CHANGED_FILES=""

if [ "$BEFORE" != "$AFTER" ]; then
  CHANGED_FILES=$(git diff --name-only "${BEFORE}" "${AFTER}" 2>/dev/null || echo "")
  echo "$CHANGED_FILES" | grep -q "^backend/"             && BACKEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "^frontend/"            && FRONTEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "backend/package"       && DEPS_BACKEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "frontend/package"      && DEPS_FRONTEND_CHANGED=true
else
  BACKEND_CHANGED=true; FRONTEND_CHANGED=true
fi

[ "$SKIP_BUILD" = true ] && { FRONTEND_CHANGED=false; DEPS_BACKEND_CHANGED=false; DEPS_FRONTEND_CHANGED=false; }

# ── STEP 3: Backend deps ─────────────────────────────────────
if [ "$DEPS_BACKEND_CHANGED" = true ] || [ ! -d "$APP_DIR/backend/node_modules" ]; then
  head "Install Backend Dependencies"
  cd "$APP_DIR/backend"
  npm install --omit=dev --silent
  ok "Backend dependencies terinstall"
fi

# ── STEP 4: Frontend build ───────────────────────────────────
if ([ "$FRONTEND_CHANGED" = true ] || [ ! -d "$APP_DIR/frontend/node_modules" ]) && [ "$SKIP_BUILD" = false ]; then
  head "Build Frontend"
  cd "$APP_DIR/frontend"
  if [ ! -d "node_modules" ] || [ "$DEPS_FRONTEND_CHANGED" = true ]; then
    npm install --silent
    ok "Frontend dependencies terinstall"
  fi
  npm run build
  ok "Frontend di-build"
fi

# ── STEP 5: Seed (opsional) ──────────────────────────────────
if [ "$RUN_SEED" = true ]; then
  head "Seed Data"
  cd "$APP_DIR/backend"
  node seeds/run.js
  ok "Seed selesai"
fi

# ── STEP 5b: Auto-run pending migrations ─────────────────────
head "Cek Pending Migrations"
MIGRATION_DIR="$APP_DIR/backend/migrations"
MIGRATION_DONE_FILE="$APP_DIR/.migrations_done"

# Baca daftar migration yang sudah dijalankan
touch "$MIGRATION_DONE_FILE"
RAN_MIGRATIONS=$(cat "$MIGRATION_DONE_FILE")

for migration_file in "$MIGRATION_DIR"/*.js; do
  migration_name=$(basename "$migration_file")
  if echo "$RAN_MIGRATIONS" | grep -qF "$migration_name"; then
    info "Skip (sudah dijalankan): $migration_name"
  else
    info "Menjalankan migration: $migration_name"
    cd "$APP_DIR/backend"
    if node "$migration_file"; then
      echo "$migration_name" >> "$MIGRATION_DONE_FILE"
      ok "Migration selesai: $migration_name"
    else
      warn "Migration gagal: $migration_name — lanjutkan tetap..."
    fi
  fi
done

# ── STEP 6: Restart backend ──────────────────────────────────
head "Restart Backend"
cd "$APP_DIR"

[ -f "$APP_DIR/backend/.env" ] || err "File .env tidak ditemukan di backend/."

if pm2 list 2>/dev/null | grep -q "$PM2_APP"; then
  # Gunakan reload (zero-downtime) — tidak ada downtime saat restart
  pm2 reload "$PM2_APP" --update-env
  ok "Backend di-reload zero-downtime"
else
  pm2 start "$APP_DIR/ecosystem.config.js"
  ok "Backend dimulai"
fi

pm2 save --force > /dev/null
ok "PM2 state disimpan"

# ── STEP 7: Verifikasi — tunggu sampai benar-benar siap ───────
head "Verifikasi"
info "Menunggu backend siap..."

# Retry sampai 30 detik (6x interval 5 detik)
MAX_RETRY=6
RETRY=0
READY=false

while [ $RETRY -lt $MAX_RETRY ]; do
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"__hc__","password":"__hc__"}' \
    --max-time 3 2>/dev/null || echo "000")

  if [ "$HTTP" = "401" ] || [ "$HTTP" = "200" ]; then
    READY=true
    ok "Backend siap (HTTP $HTTP) setelah $((RETRY * 5)) detik"
    break
  fi

  RETRY=$((RETRY + 1))
  info "Menunggu... ($RETRY/$MAX_RETRY, HTTP $HTTP)"
  sleep 5
done

if [ "$READY" = false ]; then
  warn "Backend belum merespons setelah 30 detik"
  info "Cek log: pm2 logs $PM2_APP --lines 20 --err"
fi

# Verifikasi via Nginx
if [ "$READY" = true ]; then
  HTTP_NGINX=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "http://localhost/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"__hc__","password":"__hc__"}' \
    --max-time 3 2>/dev/null || echo "000")

  if [ "$HTTP_NGINX" = "401" ] || [ "$HTTP_NGINX" = "200" ]; then
    ok "Nginx proxy OK — login bisa langsung digunakan ✓"
  else
    warn "Nginx merespons $HTTP_NGINX — reload Nginx..."
    nginx -t 2>/dev/null && systemctl reload nginx && sleep 2
    ok "Nginx di-reload"
  fi
fi

# ── Ringkasan ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  UPDATE SELESAI!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
echo ""
echo -e "  Versi : ${BOLD}$(git rev-parse --short HEAD 2>/dev/null)${NC}"
pm2 list 2>/dev/null | grep "$PM2_APP" | sed 's/^/  /' || true
echo ""
echo -e "${YELLOW}  Jika masih tidak bisa login:${NC}"
echo "  pm2 logs sdms-backend --lines 30 --err"
echo "  nginx -t"
echo ""
