#!/bin/bash
# ============================================================
# SDMS Push Script — Jalankan di lokal via Git Bash / WSL
#
# Usage:
#   bash push.sh
#   bash push.sh "pesan commit custom"
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC}  $1"; }
err()  { echo -e "${RED}✗${NC}  $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC}  $1"; }
head() { echo -e "\n${CYAN}${BOLD}══ $1 ══${NC}"; }

# ── Pindah ke root project ────────────────────────────────────
cd "$(dirname "$0")"

echo -e "${CYAN}${BOLD}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   SDMS — Push ke GitHub                  ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"

# ── Cek prasyarat ─────────────────────────────────────────────
[ -d ".git" ]              || err "Bukan git repository!"
command -v git &>/dev/null || err "git tidak terinstall!"

# ── Info repo ────────────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "(belum ada remote)")
echo -e "  Branch : ${BOLD}$BRANCH${NC}"
echo -e "  Remote : $REMOTE_URL"
echo ""

# Cek remote bisa dijangkau
if ! git ls-remote origin &>/dev/null 2>&1; then
  err "Tidak bisa menjangkau remote origin.\nCek koneksi internet atau URL remote:\n  git remote set-url origin <URL>"
fi

# ── Status Git ────────────────────────────────────────────────
head "Status Git"
git status --short

# Cek ada perubahan atau tidak
CHANGED=$(git status --porcelain)
if [ -z "$CHANGED" ]; then
  echo ""
  ok "Tidak ada perubahan — sudah up-to-date dengan commit terakhir"
  echo ""
  echo -e "  HEAD : $(git rev-parse --short HEAD) — $(git log -1 --format='%s')"
  exit 0
fi

# ── Pesan commit ──────────────────────────────────────────────
if [ -n "$1" ]; then
  MSG="$1"
else
  TANGGAL=$(date '+%Y-%m-%d %H:%M')
  # Buat pesan otomatis dari file yang berubah
  CHANGED_FILES=$(git diff --name-only; git ls-files --others --exclude-standard)
  AREAS=""
  echo "$CHANGED_FILES" | grep -q "^backend/"  && AREAS="${AREAS}backend "
  echo "$CHANGED_FILES" | grep -q "^frontend/" && AREAS="${AREAS}frontend "
  echo "$CHANGED_FILES" | grep -q "^deploy/"   && AREAS="${AREAS}deploy "
  AREAS=$(echo "$AREAS" | xargs)
  [ -n "$AREAS" ] && MSG="update $AREAS: $TANGGAL" || MSG="update: $TANGGAL"
fi

head "Review Perubahan"
info "Pesan commit: \"$MSG\""
echo ""
info "File yang akan dicommit:"
git status --short | sed 's/^/     /'
echo ""

# ── Konfirmasi ────────────────────────────────────────────────
read -p "  Lanjutkan push ke origin/$BRANCH? (y/n): " confirm
[[ "$confirm" != "y" ]] && echo "  Dibatalkan." && exit 0

# ── Commit & Push ─────────────────────────────────────────────
head "Commit & Push"
git add .
git commit -m "$MSG"
ok "Commit: $(git rev-parse --short HEAD)"

info "Push ke origin/$BRANCH..."
git push origin "$BRANCH"
ok "Push berhasil!"

# ── Ringkasan ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  PUSH SELESAI!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo ""
echo -e "  Commit : ${BOLD}$(git rev-parse --short HEAD)${NC} — $MSG"
echo ""
echo -e "${YELLOW}${BOLD}  Sekarang jalankan di VPS:${NC}"
echo -e "  ${CYAN}bash /var/www/sdms/deploy/update.sh${NC}"
echo ""
echo -e "  Atau jika hanya backend berubah (skip build frontend):"
echo -e "  ${CYAN}bash /var/www/sdms/deploy/update.sh --skip-build${NC}"
echo ""
