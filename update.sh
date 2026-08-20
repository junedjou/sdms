#!/bin/bash
# ============================================================
# SDMS Update Script — Jalankan di VPS untuk update otomatis
#
# Usage:
#   bash update.sh                   # Update penuh (pull + build + restart)
#   bash update.sh --skip-build      # Cepat: tanpa rebuild frontend
#   bash update.sh --seed            # Update + jalankan seed ulang
#   bash update.sh --force-build     # Force rebuild frontend meski tidak ada perubahan
#   bash update.sh --dry-run         # Hanya tampilkan yang akan diubah
#   bash update.sh --help            # Tampilkan bantuan
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

# ── Banner ───────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   SDMS — Update dari GitHub              ║"
echo "  ║   One Login · One Data · One Dashboard   ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── Detect direktori ────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${SCRIPT_DIR}"

# Cek apakah berada di direktori project yang benar
if [ ! -f "$APP_DIR/package.json" ] && [ ! -d "$APP_DIR/backend" ]; then
  # Coba cari di path umum
  if [ -d "/var/www/sdms" ]; then
    APP_DIR="/var/www/sdms"
  elif [ -d "$HOME/sdms" ]; then
    APP_DIR="$HOME/sdms"
  else
    err "Direktori project SDMS tidak ditemukan.\nJalankan dari root project atau /var/www/sdms"
  fi
fi

cd "$APP_DIR"
ok "Project dir: $APP_DIR"

# ── Parse argumen ────────────────────────────────────────────
SKIP_BUILD=false
RUN_SEED=false
FORCE_BUILD=false
DRY_RUN=false
SHOW_HELP=false

for arg in "$@"; do
  case $arg in
    --skip-build)  SKIP_BUILD=true ;;
    --seed)        RUN_SEED=true ;;
    --force-build) FORCE_BUILD=true ;;
    --dry-run)     DRY_RUN=true ;;
    --help|-h)     SHOW_HELP=true ;;
    *) warn "Argumen tidak dikenal: $arg" ;;
  esac
done

if [ "$SHOW_HELP" = true ]; then
  echo -e "  ${BOLD}Cara pakai:${NC}"
  echo "  bash update.sh                   # Update penuh"
  echo "  bash update.sh --skip-build      # Tanpa rebuild frontend"
  echo "  bash update.sh --seed            # Update + seed ulang"
  echo "  bash update.sh --force-build     # Force rebuild frontend"
  echo "  bash update.sh --dry-run         # Preview saja"
  echo ""
  echo -e "  ${BOLD}Tips:${NC}"
  echo "  • Jalankan setelah bash push.sh dari komputer lokal"
  echo "  • --skip-build untuk perubahan backend saja (lebih cepat)"
  echo "  • --seed jika ada perubahan data awal"
  echo ""
  exit 0
fi

# ── Prasyarat ────────────────────────────────────────────────
head "Cek Prasyarat"

# Cek git
command -v git &>/dev/null || err "git tidak terinstall!"

# Cek PM2
command -v pm2 &>/dev/null || {
  warn "PM2 tidak terinstall — menginstall..."
  npm install -g pm2 2>/dev/null || err "Gagal install PM2"
  ok "PM2 terinstall"
}

# Cek Node.js
command -v node &>/dev/null || err "Node.js tidak terinstall!"
ok "Node.js $(node --version)"
ok "npm $(npm --version)"

# Cek .env
[ -f "$APP_DIR/backend/.env" ] || err "File .env tidak ditemukan di backend/.env\nBuat dulu: cp backend/.env.example backend/.env"

# ── Git Status ───────────────────────────────────────────────
head "Git Status"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "(no remote)")

info "Branch : $BRANCH"
info "Remote : $REMOTE_URL"
echo ""

# Cek remote bisa dijangkau
if ! git ls-remote origin &>/dev/null 2>&1; then
  err "Tidak bisa menjangkau remote origin.\nCek koneksi internet atau:\n  git remote set-url origin <URL>"
fi

# ── STEP 1: Git Pull ────────────────────────────────────────
head "Git Pull dari GitHub"
BEFORE=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Stash perubahan lokal jika ada
if ! git diff --quiet 2>/dev/null; then
  info "Menyimpan perubahan lokal (git stash)..."
  git stash push -m "auto-stash $(date '+%Y%m%d-%H%M%S')" 2>/dev/null || true
fi

git fetch origin "$BRANCH" 2>&1 | sed 's/^/     /'
git reset --hard "origin/${BRANCH}"
AFTER=$(git rev-parse --short HEAD)

if [ "$BEFORE" = "$AFTER" ]; then
  ok "Sudah up-to-date (HEAD: ${AFTER})"
  if [ "$DRY_RUN" = true ]; then
    echo -e "\n${GREEN}${BOLD}  Tidak ada perubahan — selesai.${NC}"
    exit 0
  fi
else
  ok "Update: ${BEFORE} → ${AFTER}"
  echo ""
  info "Commits terbaru:"
  git log --oneline "${BEFORE}..${AFTER}" 2>/dev/null | head -10 | sed 's/^/     /'
fi

# ── STEP 2: Deteksi perubahan ────────────────────────────────
head "Deteksi Perubahan"
BACKEND_CHANGED=false; FRONTEND_CHANGED=false
DEPS_BACKEND_CHANGED=false; DEPS_FRONTEND_CHANGED=false
CONFIG_CHANGED=false

if [ "$BEFORE" != "$AFTER" ]; then
  CHANGED_FILES=$(git diff --name-only "${BEFORE}" "${AFTER}" 2>/dev/null || echo "")

  echo "$CHANGED_FILES" | grep -q "^backend/"         && BACKEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "^frontend/"        && FRONTEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "backend/package"   && DEPS_BACKEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "frontend/package"  && DEPS_FRONTEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "ecosystem.config"  && CONFIG_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "deploy/"           && CONFIG_CHANGED=true

  # Tampilkan file yang berubah
  echo ""
  info "File yang berubah:"
  echo "$CHANGED_FILES" | head -20 | sed 's/^/     /'
  [ $(echo "$CHANGED_FILES" | wc -l) -gt 20 ] && echo "     ... dan lainnya"
else
  # First run atau force rebuild
  BACKEND_CHANGED=true; FRONTEND_CHANGED=true
fi

# Force build
if [ "$FORCE_BUILD" = true ]; then
  FRONTEND_CHANGED=true
  DEPS_FRONTEND_CHANGED=true
fi

# Skip build
if [ "$SKIP_BUILD" = true ]; then
  FRONTEND_CHANGED=false
  DEPS_BACKEND_CHANGED=false
  DEPS_FRONTEND_CHANGED=false
  info "Skip build: --skip-build aktif"
fi

echo ""
[ "$BACKEND_CHANGED" = true ]        && info "Backend     : BERUBAH" || info "Backend     : tidak berubah"
[ "$FRONTEND_CHANGED" = true ]       && info "Frontend    : PERLU BUILD" || info "Frontend    : tidak berubah"
[ "$DEPS_BACKEND_CHANGED" = true ]   && info "Deps Backend: PERLU INSTALL" || true
[ "$DEPS_FRONTEND_CHANGED" = true ]  && info "Deps Frontend: PERLU INSTALL" || true
[ "$CONFIG_CHANGED" = true ]         && info "Config      : BERUBAH" || true

# ── Dry run exit ─────────────────────────────────────────────
if [ "$DRY_RUN" = true ]; then
  echo ""
  echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
  echo -e "${GREEN}${BOLD}  DRY RUN SELESAI — tidak ada perubahan${NC}"
  echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
  exit 0
fi

# ── STEP 3: Auto-fix Nginx duplikat ──────────────────────────
NGINX_CONF="/etc/nginx/sites-available/sdms"
if [ -f "$NGINX_CONF" ]; then
  head "Cek Nginx Config"
  TIMEOUT_COUNT=$(grep -c "proxy_read_timeout" "$NGINX_CONF" 2>/dev/null || echo "0")
  if [ "$TIMEOUT_COUNT" -gt "1" ]; then
    warn "Nginx config duplikat — auto-fix..."
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
    nginx -t 2>/dev/null && systemctl reload nginx
    ok "Nginx config diperbaiki"
  else
    ok "Nginx config OK"
  fi

  if ! systemctl is-active --quiet nginx 2>/dev/null; then
    warn "Nginx tidak berjalan — mencoba start..."
    systemctl start nginx 2>/dev/null || true
  fi
fi

# ── STEP 4: Backend dependencies ─────────────────────────────
if [ "$DEPS_BACKEND_CHANGED" = true ] || [ ! -d "$APP_DIR/backend/node_modules" ]; then
  head "Install Backend Dependencies"
  cd "$APP_DIR/backend"
  npm install --omit=dev --silent 2>&1 | tail -3 | sed 's/^/     /'
  ok "Backend dependencies terinstall"
fi

# ── STEP 5: Frontend build ───────────────────────────────────
if ([ "$FRONTEND_CHANGED" = true ] || [ ! -d "$APP_DIR/frontend/node_modules" ]) && [ "$SKIP_BUILD" = false ]; then
  head "Build Frontend"
  cd "$APP_DIR/frontend"

  if [ ! -d "node_modules" ] || [ "$DEPS_FRONTEND_CHANGED" = true ]; then
    info "Installing frontend dependencies..."
    npm install --silent 2>&1 | tail -3 | sed 's/^/     /'
    ok "Frontend dependencies terinstall"
  fi

  info "Building frontend..."
  npm run build 2>&1 | tail -5 | sed 's/^/     /'
  ok "Frontend di-build ke frontend/dist/"
fi

# ── STEP 6: Seed (opsional) ──────────────────────────────────
if [ "$RUN_SEED" = true ]; then
  head "Seed Data Awal"
  cd "$APP_DIR/backend"
  node seeds/run.js 2>&1 | sed 's/^/     /'
  ok "Seed selesai"
fi

# ── STEP 7: Auto-run pending migrations ──────────────────────
MIGRATION_DIR="$APP_DIR/backend/migrations"
MIGRATION_DONE_FILE="$APP_DIR/.migrations_done"

if [ -d "$MIGRATION_DIR" ]; then
  head "Cek Pending Migrations"
  touch "$MIGRATION_DONE_FILE"
  RAN_MIGRATIONS=$(cat "$MIGRATION_DONE_FILE")
  MIGRATION_RUN=false

  for migration_file in "$MIGRATION_DIR"/*.js; do
    [ -f "$migration_file" ] || continue
    migration_name=$(basename "$migration_file")
    if echo "$RAN_MIGRATIONS" | grep -qF "$migration_name"; then
      info "Skip (sudah jalan): $migration_name"
    else
      info "Jalankan migration: $migration_name"
      cd "$APP_DIR/backend"
      if node "$migration_file" 2>&1 | sed 's/^/     /'; then
        echo "$migration_name" >> "$MIGRATION_DONE_FILE"
        ok "Migration selesai: $migration_name"
        MIGRATION_RUN=true
      else
        warn "Migration gagal: $migration_name — dilanjutkan..."
      fi
    fi
  done

  [ "$MIGRATION_RUN" = false ] && ok "Tidak ada migration baru"
fi

# ── STEP 8: Restart Backend ──────────────────────────────────
head "Restart Backend"
cd "$APP_DIR"

if pm2 list 2>/dev/null | grep -q "sdms-backend"; then
  if [ "$CONFIG_CHANGED" = true ]; then
    pm2 delete sdms-backend 2>/dev/null || true
    pm2 start "$APP_DIR/ecosystem.config.js"
    ok "Backend dimulai ulang (config berubah)"
  else
    pm2 reload sdms-backend --update-env 2>&1 | tail -3 | sed 's/^/     /'
    ok "Backend di-reload (zero-downtime)"
  fi
else
  pm2 start "$APP_DIR/ecosystem.config.js"
  ok "Backend dimulai"
fi

pm2 save --force > /dev/null 2>&1
ok "PM2 state disimpan"

# ── STEP 9: Verifikasi ──────────────────────────────────────
head "Verifikasi"
info "Menunggu backend siap..."

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
    ok "Backend siap (HTTP $HTTP) — $((RETRY * 5)) detik"
    break
  fi

  RETRY=$((RETRY + 1))
  info "Menunggu... ($RETRY/$MAX_RETRY, HTTP $HTTP)"
  sleep 5
done

if [ "$READY" = false ]; then
  warn "Backend belum merespons setelah 30 detik"
  echo ""
  info "Debugging:"
  echo "  pm2 logs sdms-backend --lines 20 --err"
  echo "  pm2 status"
fi

# Verifikasi Nginx
if command -v nginx &>/dev/null && [ -f "$NGINX_CONF" ]; then
  HTTP_NGINX=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "http://localhost/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"__hc__","password":"__hc__"}' \
    --max-time 3 2>/dev/null || echo "000")

  if [ "$HTTP_NGINX" = "401" ] || [ "$HTTP_NGINX" = "200" ]; then
    ok "Nginx proxy OK — frontend bisa akses API"
  else
    info "Reload Nginx..."
    nginx -t 2>/dev/null && systemctl reload nginx && sleep 2
    ok "Nginx di-reload"
  fi
fi

# ── Ringkasan ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✓  UPDATE SELESAI!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo ""
echo -e "  Versi   : ${BOLD}$(git rev-parse --short HEAD 2>/dev/null)${NC}"
echo -e "  Commit  : $(git log -1 --format='%s' 2>/dev/null)"
echo ""
pm2 list 2>/dev/null | grep "sdms-backend" | sed 's/^/  /' || true
echo ""
echo -e "  ${YELLOW}Perintah berguna:${NC}"
echo "  pm2 logs sdms-backend           # Lihat log"
echo "  pm2 logs sdms-backend --err     # Lihat error"
echo "  pm2 restart sdms-backend        # Restart manual"
echo "  nginx -t                        # Cek config Nginx"
echo ""
