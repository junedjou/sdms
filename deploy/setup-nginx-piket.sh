#!/bin/bash
# ============================================================
# Setup Nginx untuk Aplikasi SIPAKAR (Piket)
# Jalankan sekali di VPS: bash /var/www/sdms/deploy/setup-nginx-piket.sh
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC}  $1"; }
err()  { echo -e "${RED}✗${NC}  $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC}  $1"; }
head() { echo -e "\n${CYAN}${BOLD}══ $1 ══${NC}"; }

# ── Deteksi konfigurasi SIPAKAR ──────────────────────────────
SIPAKAR_DIR="/root/SIPAKAR"
FRONTEND_DIST="$SIPAKAR_DIR/frontend/dist"
BACKEND_ENV="$SIPAKAR_DIR/backend/.env"

[ -d "$SIPAKAR_DIR" ]     || err "Direktori $SIPAKAR_DIR tidak ditemukan!"
[ -d "$FRONTEND_DIST" ]   || err "Build frontend tidak ditemukan di $FRONTEND_DIST. Jalankan dulu: cd $SIPAKAR_DIR/frontend && npm run build"
[ -f "$BACKEND_ENV" ]     || err "File .env backend tidak ditemukan di $BACKEND_ENV"

# Baca PORT dari .env backend SIPAKAR
BACKEND_PORT=$(grep -E "^PORT=" "$BACKEND_ENV" | cut -d= -f2 | tr -d ' \r')
[ -z "$BACKEND_PORT" ] && BACKEND_PORT="4002"

# Baca DOMAIN dari .env backend SIPAKAR
APP_URL=$(grep -E "^APP_URL=|^FRONTEND_URL=" "$BACKEND_ENV" | head -1 | cut -d= -f2 | tr -d ' \r')
DOMAIN=$(echo "$APP_URL" | sed 's|https\?://||' | sed 's|/.*||')
[ -z "$DOMAIN" ] && DOMAIN="pike.smkn1kras.sch.id"

echo -e "${CYAN}${BOLD}"
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   Setup Nginx SIPAKAR (Piket)            ║"
echo "  ╚══════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  Frontend : ${BOLD}$FRONTEND_DIST${NC}"
echo -e "  Backend  : ${BOLD}http://127.0.0.1:$BACKEND_PORT${NC}"
echo -e "  Domain   : ${BOLD}$DOMAIN${NC}"
echo ""
read -p "  Lanjutkan? (y/n): " confirm
[[ "$confirm" != "y" ]] && exit 0

# ── Fix permission folder (karena ada di /root/) ─────────────
head "Fix Permission"
chmod 755 /root
chmod 755 "$SIPAKAR_DIR"
chmod 755 "$SIPAKAR_DIR/frontend"
chmod -R 755 "$FRONTEND_DIST"
ok "Permission /root/SIPAKAR diperbaiki"

# ── Buat log dir ─────────────────────────────────────────────
mkdir -p /var/log/nginx
ok "Log dir siap"

# ── Tulis Nginx config ───────────────────────────────────────
head "Buat Nginx Config"
cat > /etc/nginx/sites-available/sipakar << NGINXCONF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # ── Frontend SPA (React + Vite) ──
    # try_files WAJIB agar React Router bisa handle /sso/callback dan route lainnya
    location / {
        root $FRONTEND_DIST;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        # Cache aset statis 1 tahun
        location ~* \.(js|css|png|jpg|jpeg|svg|ico|woff2?|webmanifest)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # ── Backend API proxy ──
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
        client_max_body_size 10M;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
    }

    access_log /var/log/nginx/sipakar.access.log;
    error_log  /var/log/nginx/sipakar.error.log;
}
NGINXCONF

ok "Nginx config ditulis ke /etc/nginx/sites-available/sipakar"

# ── Enable site ──────────────────────────────────────────────
ln -sf /etc/nginx/sites-available/sipakar /etc/nginx/sites-enabled/sipakar
ok "Site di-enable"

# ── Test & reload Nginx ──────────────────────────────────────
head "Test & Reload Nginx"
nginx -t || err "Nginx config error! Cek output di atas."
systemctl reload nginx
ok "Nginx di-reload"

# ── Verifikasi ───────────────────────────────────────────────
head "Verifikasi"
sleep 1

# Cek frontend bisa diakses
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ \
    -H "Host: $DOMAIN" --max-time 5 2>/dev/null || echo "000")

if [ "$HTTP" = "200" ]; then
    ok "Frontend bisa diakses (HTTP $HTTP)"
else
    info "Frontend merespons HTTP $HTTP (bukan 200 — mungkin domain belum diarahkan ke server ini)"
fi

# Cek backend
HTTP_API=$(curl -s -o /dev/null -w "%{http_code}" \
    "http://127.0.0.1:$BACKEND_PORT/api/health" \
    --max-time 3 2>/dev/null || echo "000")

if [ "$HTTP_API" != "000" ]; then
    ok "Backend SIPAKAR merespons (HTTP $HTTP_API)"
else
    info "Backend SIPAKAR belum merespons di port $BACKEND_PORT"
    info "Pastikan backend berjalan: pm2 list"
fi

# ── Ringkasan ─────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  SETUP SELESAI!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo ""
echo -e "  Nginx config : /etc/nginx/sites-available/sipakar"
echo -e "  Frontend     : $FRONTEND_DIST"
echo -e "  Backend port : $BACKEND_PORT"
echo -e "  Domain       : http://$DOMAIN"
echo ""
echo -e "${YELLOW}  Jika SSO masih 404, pastikan backend SIPAKAR berjalan:${NC}"
echo "    pm2 list"
echo "    pm2 start /root/SIPAKAR/ecosystem.config.js"
echo ""
echo -e "${YELLOW}  Untuk HTTPS (SSL):${NC}"
echo "    apt install certbot python3-certbot-nginx -y"
echo "    certbot --nginx -d $DOMAIN"
echo ""
