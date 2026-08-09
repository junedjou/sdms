#!/bin/bash
# ============================================================
# SDMS Push Script — Jalankan di lokal (Git Bash / WSL)
# Commit semua perubahan dan push ke GitHub
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
echo "  ╔══════════════════════════════════╗"
echo "  ║   SDMS — Push ke GitHub          ║"
echo "  ╚══════════════════════════════════╝"
echo -e "${NC}"

# ── Cek git repo ──────────────────────────────────────────────
[ -d ".git" ] || err "Bukan git repository!"

# ── Cek ada perubahan ─────────────────────────────────────────
head "Status Git"
git status --short

if git diff --quiet && git diff --cached --quiet; then
  # Cek untracked files
  UNTRACKED=$(git ls-files --others --exclude-standard | wc -l)
  if [ "$UNTRACKED" -eq 0 ]; then
    echo ""
    ok "Tidak ada perubahan — sudah up-to-date"
    exit 0
  fi
fi

# ── Pesan commit ──────────────────────────────────────────────
if [ -n "$1" ]; then
  MSG="$1"
else
  TANGGAL=$(date '+%Y-%m-%d %H:%M')
  MSG="update: $TANGGAL"
fi

head "Commit & Push"
info "Pesan: $MSG"

# Stage semua perubahan (kecuali yang di .gitignore)
git add .

# Tampilkan apa yang di-commit
echo ""
info "File yang dicommit:"
git diff --cached --name-only | sed 's/^/     /'
echo ""

# Konfirmasi
read -p "  Lanjutkan push? (y/n): " confirm
[[ "$confirm" != "y" ]] && echo "Dibatalkan." && exit 0

# Commit
git commit -m "$MSG"
ok "Commit berhasil"

# Push
BRANCH=$(git rev-parse --abbrev-ref HEAD)
info "Push ke origin/$BRANCH..."
git push origin "$BRANCH"
ok "Push berhasil — HEAD: $(git rev-parse --short HEAD)"

echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  PUSH SELESAI!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
echo ""
echo -e "  Sekarang jalankan di VPS SDMS:"
echo -e "  ${CYAN}bash /var/www/sdms/deploy/update.sh${NC}"
echo ""
