#!/bin/bash
# ============================================================
# SDMS Deploy Script untuk VPS Linux (Ubuntu 20.04/22.04)
# Jalankan sekali saat pertama kali setup VPS
# Usage: bash deploy.sh
# ============================================================

set -e  # Stop jika ada error

# ── Warna output ─────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'; BOLD='\033[1m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; exit 1; }
info() { echo -e "${YELLOW}→${NC} $1"; }
head() { echo -e "\n${CYAN}${BOLD}=== $1 ===${NC}"; }

# ── Konfigurasi — EDIT SESUAI KEBUTUHAN ──────────────────────
APP_DIR="/var/www/sdms"
DOMAIN="sdms.sekolah.sch.id"        # Ganti dengan domain Anda
DB_NAME="sdms_master"
DB_USER="sdms_user"
DB_PASS="GantiPasswordIni2024!"     # GANTI PASSWORD INI!
NODE_VERSION="20"

head "SDMS VPS Deploy Script"
echo "  Domain  : $DOMAIN"
echo "  App Dir : $APP_DIR"
echo "  DB      : $DB_NAME"
echo ""
read -p "Lanjutkan? (y/n): " confirm
[[ "$confirm" != "y" ]] && exit 0

# ── 1. Update sistem ─────────────────────────────────────────
head "Update Sistem"
apt-get update -qq && apt-get upgrade -y -qq
ok "Sistem diupdate"

# ── 2. Install Node.js ───────────────────────────────────────
head "Install Node.js $NODE_VERSION"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null
apt-get install -y nodejs -qq
ok "Node.js $(node --version) terinstall"
ok "npm $(npm --version) terinstall"

# ── 3. Install MariaDB ───────────────────────────────────────
head "Install MariaDB"
apt-get install -y mariadb-server mariadb-client -qq
systemctl start mariadb
systemctl enable mariadb
ok "MariaDB terinstall dan berjalan"

# Buat database dan user
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
ok "Database $DB_NAME dan user $DB_USER dibuat"

# ── 4. Install PM2 ───────────────────────────────────────────
head "Install PM2"
npm install -g pm2 -q
ok "PM2 $(pm2 --version) terinstall"

# ── 5. Install Nginx ─────────────────────────────────────────
head "Install Nginx"
apt-get install -y nginx -qq
ok "Nginx terinstall"

# ── 6. Buat direktori aplikasi ───────────────────────────────
head "Setup Direktori"
mkdir -p $APP_DIR/backend
mkdir -p $APP_DIR/frontend
mkdir -p $APP_DIR/logs
mkdir -p /var/log/sdms
ok "Direktori $APP_DIR dibuat"

# ── 7. Konfigurasi Nginx ─────────────────────────────────────
head "Konfigurasi Nginx"
cat > /etc/nginx/sites-available/sdms <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Frontend (Vue build)
    location / {
        root $APP_DIR/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|svg|ico|woff2?)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
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
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
    }

    # Log
    access_log /var/log/nginx/sdms.access.log;
    error_log  /var/log/nginx/sdms.error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/sdms /etc/nginx/sites-enabled/sdms
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
ok "Nginx dikonfigurasi untuk domain $DOMAIN"

# ── 8. Setup .env backend ────────────────────────────────────
head "Buat File .env Backend"
cat > $APP_DIR/backend/.env <<ENV
NODE_ENV=production
PORT=3000
APP_NAME=SDMS
APP_URL=http://$DOMAIN
FRONTEND_URL=http://$DOMAIN

# JWT — WAJIB GANTI dengan string random panjang!
JWT_SECRET=$(openssl rand -base64 48)
JWT_EXPIRES_IN=8h
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
JWT_REFRESH_EXPIRES_IN=7d

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME

# Opsional
MONGO_ENABLED=false
REDIS_ENABLED=false

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
ALLOWED_ORIGINS=http://$DOMAIN,https://$DOMAIN

LOG_LEVEL=info
LOG_DIR=/var/log/sdms
ENV
ok "File .env backend dibuat"

# ── 9. PM2 ecosystem config ──────────────────────────────────
head "Konfigurasi PM2"
cat > $APP_DIR/ecosystem.config.js <<PM2
module.exports = {
  apps: [{
    name: 'sdms-backend',
    script: '$APP_DIR/backend/src/server.js',
    cwd: '$APP_DIR/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/sdms/pm2-error.log',
    out_file: '/var/log/sdms/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
PM2
ok "PM2 ecosystem.config.js dibuat"

# ── 10. Startup otomatis PM2 ─────────────────────────────────
pm2 startup systemd -u root --hp /root > /dev/null
ok "PM2 startup otomatis dikonfigurasi"

head "SETUP SELESAI!"
echo ""
echo -e "${GREEN}${BOLD}Langkah selanjutnya:${NC}"
echo "  1. Upload kode ke VPS (lihat upload.sh)"
echo "  2. Install dependencies: npm install"
echo "  3. Build frontend: npm run build"
echo "  4. Jalankan seed: node seeds/run.js"
echo "  5. Start backend: pm2 start ecosystem.config.js"
echo "  6. Buka: http://$DOMAIN"
echo ""
echo -e "${YELLOW}Untuk HTTPS gratis dengan Certbot:${NC}"
echo "  apt install certbot python3-certbot-nginx"
echo "  certbot --nginx -d $DOMAIN"
