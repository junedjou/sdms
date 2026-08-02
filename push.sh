#!/bin/bash
# ============================================================
# SDMS Push Script — Jalankan di komputer lokal
# Commit semua perubahan dan push ke GitHub
#
# Usage:
#   bash push.sh                   → commit dengan pesan otomatis
#   bash push.sh "pesan commit"    → commit dengan pesan custom
# ============================================================

set -e

# ── Warna ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC}  $1"; }
err()  { echo -e "${RED}✗${NC}  $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC}  $1"; }
head() { echo -e "\n${CYAN}${BOLD}══ $1 ══${NC}"; }

# ── Root project (folder tempat push.sh berada) ──────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Banner ───────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}"
echo "  ╔══════════════════════════════════╗"
echo "  ║   SDMS — Push to GitHub          ║"
echo "  ╚══════════════════════════════════╝"
echo -e "${NC}"

# ── Pastikan ini adalah git repo ─────────────────────────────
if [ ! -d ".git" ]; then
  err "Folder ini bukan git repository.\n   Jalankan dulu:\n   git init && git remote add origin https://github.com/USER/sdms.git"
fi

# ── Ambil info repo ──────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "(belum ada remote)")

echo -e "  Branch  : ${BOLD}${BRANCH}${NC}"
echo -e "  Remote  : ${BOLD}${REMOTE_URL}${NC}"
echo ""

# ── Cek apakah ada remote origin ─────────────────────────────
if ! git remote get-url origin &>/dev/null; then
  err "Remote 'origin' belum dikonfigurasi.\n   Jalankan: git remote add origin https://github.com/USER/sdms.git"
fi

# ── Cek status git ───────────────────────────────────────────
head "Cek Status"
CHANGED=$(git status --porcelain | wc -l | tr -d ' ')

if [ "$CHANGED" -eq 0 ]; then
  ok "Tidak ada perubahan — working tree bersih"
  info "Tidak ada yang perlu di-push."
  echo ""
  exit 0
fi

info "Ditemukan ${CHANGED} file berubah:"
git status --short | sed 's/^/     /'
echo ""

# ── Pesan commit ─────────────────────────────────────────────
if [ -n "$1" ]; then
  COMMIT_MSG="$1"
else
  # Otomatis: timestamp + ringkasan file berubah
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
  COMMIT_MSG="update: ${TIMESTAMP}"
fi

echo -e "  Pesan commit: ${BOLD}\"${COMMIT_MSG}\"${NC}"
echo ""

# ── Stage semua perubahan ────────────────────────────────────
head "Git Stage"
git add -A
ok "Semua perubahan di-stage"

# ── Commit ───────────────────────────────────────────────────
head "Git Commit"
git commit -m "$COMMIT_MSG"
ok "Commit berhasil: \"${COMMIT_MSG}\""

# ── Push ─────────────────────────────────────────────────────
head "Git Push → ${BRANCH}"
info "Mendorong ke origin/${BRANCH}..."

if git push origin "$BRANCH" 2>&1; then
  ok "Push berhasil ke GitHub"
else
  # Kalau branch belum ada di remote, set upstream dulu
  info "Branch baru — set upstream dan push..."
  git push --set-upstream origin "$BRANCH"
  ok "Push berhasil (upstream baru: origin/${BRANCH})"
fi

# ── Ringkasan ────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  PUSH SELESAI!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════${NC}"
echo ""
LAST_HASH=$(git rev-parse --short HEAD)
echo -e "  Commit : ${BOLD}${LAST_HASH}${NC} — ${COMMIT_MSG}"
echo -e "  Branch : ${BOLD}${BRANCH}${NC} → origin"
echo ""
echo -e "${YELLOW}  Langkah selanjutnya — di VPS:${NC}"
echo -e "  ${BOLD}bash /var/www/sdms/deploy/update.sh${NC}"
echo ""
