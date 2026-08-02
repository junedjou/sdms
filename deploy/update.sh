#!/bin/bash
# ============================================================
# SDMS Update Script — Jalankan di VPS setiap ada update kode
# Pull dari GitHub, rebuild frontend, restart backend
#
# Usage:
#   bash /var/www/sdms/deploy/update.sh
#   bash /var/www/sdms/deploy/update.sh --skip-build   (skip npm build, hanya restart)
#   bash /var/www/sdms/deploy/update.sh --seed          (jalankan seed ulang setelah update)
# ============================================================

set -e

# ── Warna ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC}  $1"; }
err()  { echo -e "${RED}✗${NC}  $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC}  $1"; }
head() { echo -e "\n${CYAN}${BOLD}══ $1 ══${NC}"; }

# ── Konfigurasi ──────────────────────────────────────────────
APP_DIR="/var/www/sdms"
BRANCH="main"                        # Ganti jika pakai branch lain (misal: production)
PM2_APP="sdms-backend"

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
echo -e "  App Dir  : ${BOLD}${APP_DIR}${NC}"
echo -e "  Branch   : ${BOLD}${BRANCH}${NC}"
echo -e "  Skip Build: ${BOLD}${SKIP_BUILD}${NC}"
echo -e "  Run Seed  : ${BOLD}${RUN_SEED}${NC}"
echo ""

# ── Pastikan app dir ada ─────────────────────────────────────
[ -d "$APP_DIR" ] || err "Direktori $APP_DIR tidak ditemukan. Jalankan deploy.sh dulu."
cd "$APP_DIR"

# ── Pastikan ini git repo ────────────────────────────────────
[ -d ".git" ] || err "Bukan git repository. Lakukan 'git clone' dulu (lihat PANDUAN-VPS.md)."

# ── 1. Git pull ──────────────────────────────────────────────
head "Git Pull dari GitHub"
info "Mengambil update dari branch '${BRANCH}'..."

# Simpan hash sebelum pull untuk perbandingan
BEFORE=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Stash kalau ada perubahan lokal (misal .env yang tidak sengaja berubah)
if ! git diff --quiet 2>/dev/null; then
  info "Ada perubahan lokal — disimpan sementara (git stash)..."
  git stash push -m "auto-stash sebelum update $(date '+%Y%m%d-%H%M%S')"
fi

git fetch origin "$BRANCH"
git reset --hard "origin/${BRANCH}"

AFTER=$(git rev-parse --short HEAD)
if [ "$BEFORE" = "$AFTER" ]; then
  ok "Kode sudah up-to-date (HEAD: ${AFTER})"
else
  ok "Update berhasil: ${BEFORE} → ${AFTER}"
  # Tampilkan commit baru
  echo ""
  info "Perubahan terbaru:"
  git log --oneline "${BEFORE}..${AFTER}" 2>/dev/null | head -10 | sed 's/^/     /'
  echo ""
fi

# ── 2. Deteksi file yang berubah ─────────────────────────────
BACKEND_CHANGED=false
FRONTEND_CHANGED=false
DEPS_BACKEND_CHANGED=false
DEPS_FRONTEND_CHANGED=false

if [ "$BEFORE" != "$AFTER" ]; then
  CHANGED_FILES=$(git diff --name-only "${BEFORE}" "${AFTER}" 2>/dev/null || echo "")

  echo "$CHANGED_FILES" | grep -q "^backend/"  && BACKEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "^frontend/" && FRONTEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "backend/package.*json"  && DEPS_BACKEND_CHANGED=true
  echo "$CHANGED_FILES" | grep -q "frontend/package.*json" && DEPS_FRONTEND_CHANGED=true
else
  # Tidak ada perubahan dari git, tetap jalankan rebuild jika tidak --skip-build
  BACKEND_CHANGED=true
  FRONTEND_CHANGED=true
fi

# --skip-build override
if [ "$SKIP_BUILD" = true ]; then
  FRONTEND_CHANGED=false
  DEPS_BACKEND_CHANGED=false
  DEPS_FRONTEND_CHANGED=false
fi

# ── 3. Update backend dependencies ──────────────────────────
if [ "$DEPS_BACKEND_CHANGED" = true ]; then
  head "Update Backend Dependencies"
  cd "$APP_DIR/backend"
  info "package.json berubah — install ulang..."
  npm install --omit=dev --silent
  ok "Backend dependencies diupdate"
fi

# ── 4. Update frontend dependencies + rebuild ───────────────
if [ "$FRONTEND_CHANGED" = true ] && [ "$SKIP_BUILD" = false ]; then
  head "Build Frontend"
  cd "$APP_DIR/frontend"

  if [ "$DEPS_FRONTEND_CHANGED" = true ]; then
    info "package.json berubah — install ulang..."
    npm install --silent
    ok "Frontend dependencies diupdate"
  fi

  info "Build Vue app..."
  npm run build
  ok "Frontend berhasil di-build (dist/ diperbarui)"
fi

# ── 5. Jalankan seed (opsional) ──────────────────────────────
if [ "$RUN_SEED" = true ]; then
  head "Seed Data"
  cd "$APP_DIR/backend"
  info "Menjalankan seed..."
  node seeds/run.js
  ok "Seed selesai"
fi

# ── 6. Restart backend ───────────────────────────────────────
head "Restart Backend"
cd "$APP_DIR"

if pm2 list 2>/dev/null | grep -q "$PM2_APP"; then
  if [ "$BACKEND_CHANGED" = true ] || [ "$SKIP_BUILD" = false ]; then
    pm2 restart "$PM2_APP" --update-env
    ok "Backend di-restart (${PM2_APP})"
  else
    ok "Backend tidak berubah — tidak perlu restart"
  fi
else
  info "PM2 process tidak ditemukan — memulai dari ecosystem.config.js..."
  pm2 start "$APP_DIR/ecosystem.config.js"
  ok "Backend dimulai"
fi

pm2 save --force > /dev/null
ok "PM2 process list disimpan"

# ── 7. Reload Nginx ──────────────────────────────────────────
head "Reload Nginx"
if nginx -t 2>/dev/null; then
  systemctl reload nginx
  ok "Nginx di-reload"
else
  err "Konfigurasi Nginx error — tidak di-reload. Cek: nginx -t"
fi

# ── 8. Health check ──────────────────────────────────────────
head "Health Check"
info "Menunggu backend siap..."
sleep 2

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "204" ]; then
  ok "Backend merespons HTTP ${HTTP_STATUS} — sehat!"
elif [ "$HTTP_STATUS" = "000" ]; then
  info "Health check tidak merespons — cek log: pm2 logs ${PM2_APP} --lines 20"
else
  info "Backend merespons HTTP ${HTTP_STATUS} — monitor: pm2 logs ${PM2_APP}"
fi

# ── Ringkasan ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  UPDATE SELESAI!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
echo ""
CURRENT=$(git -C "$APP_DIR" rev-parse --short HEAD 2>/dev/null)
echo -e "  Versi aktif : ${BOLD}${CURRENT}${NC}"
echo -e "  PM2 status  :"
pm2 list 2>/dev/null | grep "$PM2_APP" | sed 's/^/    /' || true
echo ""
echo -e "${YELLOW}  Perintah berguna:${NC}"
echo "  pm2 logs sdms-backend          → lihat log realtime"
echo "  pm2 monit                      → monitor CPU/RAM"
echo "  bash /var/www/sdms/deploy/update.sh --skip-build  → hanya restart"
echo ""
