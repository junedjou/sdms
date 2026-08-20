# Panduan Deploy SDMS ke VPS

## Workflow Harian (GitHub-based)

Ini adalah alur yang dipakai setelah setup VPS selesai.

```
[Komputer Lokal]                    [GitHub]            [VPS]
      │                                 │                  │
      │  bash push.sh "pesan commit"    │                  │
      │ ──────────────────────────────► │                  │
      │  (git add + commit + push)      │                  │
      │                                 │                  │
      │                                 │  bash update.sh  │
      │                                 │ ◄────────────────│
      │                                 │  (git pull +     │
      │                                 │   build + restart│
```

**Di komputer lokal** setelah ada perubahan kode:
```bash
bash push.sh "deskripsi perubahan"
# atau singkat tanpa pesan (otomatis pakai timestamp):
bash push.sh
```

**Di VPS** setelah push.sh selesai:
```bash
bash /var/www/sdms/update.sh
```

Opsi tambahan `update.sh`:
```bash
bash update.sh                   # pull + build + restart (default)
bash update.sh --skip-build      # hanya git pull + restart (cepat, tanpa rebuild frontend)
bash update.sh --seed            # pull + build + restart + jalankan seed ulang
bash update.sh --force-build     # force rebuild frontend meski tidak ada perubahan
bash update.sh --dry-run         # preview saja, tidak eksekusi
```

**Quick reload** (tanpa git pull, hanya restart):
```bash
bash /var/www/sdms/deploy/hot-reload.sh           # restart backend + reload nginx
bash /var/www/sdms/deploy/hot-reload.sh --backend # restart backend saja
bash /var/www/sdms/deploy/hot-reload.sh --rebuild # rebuild frontend + restart
```

---

## Spesifikasi VPS yang Disarankan

| Komponen | Minimum | Rekomendasi |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 1 GB | 2 GB |
| Storage | 20 GB | 40 GB |
| OS | Ubuntu 20.04 | Ubuntu 22.04 LTS |

Provider VPS yang bagus dan murah: **Niagahoster**, **IDCloudHost**, **DigitalOcean**, **Vultr**, **Contabo**

---

## Cara 1 — Upload Otomatis via Python (Paling Mudah)

### Langkah di Komputer Lokal:

**1. Edit konfigurasi VPS di `deploy/upload.py`:**
```python
VPS_HOST = "123.456.789.0"   # ← Ganti dengan IP VPS Anda
VPS_USER = "root"
VPS_PASS = "password_vps"    # ← Password SSH VPS Anda
APP_DIR  = "/var/www/sdms"
```

**2. Setup VPS dulu (SSH ke VPS, jalankan script ini):**
```bash
ssh root@IP_VPS
bash -c "$(curl -fsSL https://deb.nodesource.com/setup_20.x)" | bash
apt install -y nodejs mariadb-server nginx
npm install -g pm2
```

**3. Dari komputer lokal, jalankan upload:**
```cmd
python d:\WEBSITE\sdms\deploy\upload.py
```

Script akan otomatis:
- Upload semua file
- Install npm dependencies
- Build frontend
- Seed data awal
- Start dengan PM2

---

## Cara 2 — Upload Manual via FileZilla (FTP)

### Step 1: Install FileZilla
Download dari https://filezilla-project.org/

### Step 2: Koneksi ke VPS
```
Host     : IP_VPS
Username : root
Password : password_vps
Port     : 22
Protocol : SFTP
```

### Step 3: Upload file
Upload folder-folder ini ke `/var/www/sdms/` di VPS:
- `backend/` (kecuali folder `node_modules/` dan `logs/`)
- `frontend/` (kecuali folder `node_modules/` dan `dist/`)
- `deploy/`

### Step 4: Setup di VPS via SSH
```bash
ssh root@IP_VPS
bash /var/www/sdms/deploy/deploy.sh      # Setup server (sekali saja)
bash /var/www/sdms/deploy/setup-after-upload.sh  # Install & start
```

---

## Cara 3 — Via Git + GitHub (Rekomendasi Developer)

Ini cara yang paling efisien untuk development berkelanjutan. Setelah setup awal, cukup jalankan `push.sh` dari lokal dan `update.sh` di VPS.

### Setup awal di komputer lokal

**1. Buat repository di GitHub** (jika belum ada):
- Buka https://github.com/new
- Nama repo: `sdms` (atau sesuai keinginan)
- Pilih **Private** (disarankan karena ada konfigurasi sensitif)
- Klik **Create repository**

**2. Inisialisasi git di folder proyek:**
```bash
# Di komputer lokal (Git Bash / WSL / Terminal)
cd d:/WEBSITE/sdms
git init
git branch -M main
git remote add origin https://github.com/USERNAME/sdms.git
```

**3. Pastikan .gitignore sudah benar** (file sensitif tidak ikut push):
```
node_modules/
dist/
.env
logs/
*.log
```

**4. Push pertama kali:**
```bash
bash push.sh "initial commit"
```

### Setup awal di VPS (sekali saja)

```bash
ssh root@IP_VPS

# Clone repository
cd /var/www
git clone https://github.com/USERNAME/sdms.git
cd sdms

# Jalankan script setup server (install Node, MariaDB, Nginx, PM2)
bash deploy/deploy.sh

# Buat file .env backend (TIDAK ada di git karena .gitignore)
nano backend/.env
# → isi sesuai template di bawah

# Install deps, build, seed, start
bash deploy/setup-after-upload.sh
```

### Update rutin setelah setup

```bash
# Di komputer lokal:
bash push.sh "update tampilan dashboard"

# Di VPS (SSH):
bash /var/www/sdms/update.sh

# atau tanpa SSH langsung dari push.sh output:
# bash /var/www/sdms/update.sh --skip-build  # cepat
```

---

## Konfigurasi .env di VPS

File `.env` TIDAK diupload (ada di `.gitignore`). Buat manual di VPS:

```bash
nano /var/www/sdms/backend/.env
```

Isi dengan (sesuaikan):
```env
NODE_ENV=production
PORT=3000
APP_URL=http://sdms.sekolah.sch.id
FRONTEND_URL=http://sdms.sekolah.sch.id

# JWT — WAJIB pakai string random panjang!
JWT_SECRET=isi_string_random_64_karakter_disini
JWT_REFRESH_SECRET=isi_string_random_lain_64_karakter

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=sdms_user
DB_PASSWORD=password_database
DB_NAME=sdms_master

# Nonaktif default
MONGO_ENABLED=false
REDIS_ENABLED=false

RATE_LIMIT_MAX=200
ALLOWED_ORIGINS=http://sdms.sekolah.sch.id
LOG_LEVEL=info
LOG_DIR=/var/log/sdms
```

Generate JWT secret random:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Pasang HTTPS Gratis (Certbot)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d sdms.sekolah.sch.id
```

Certbot otomatis update konfigurasi Nginx dan renew sertifikat setiap 90 hari.

---

## Perintah PM2 di VPS

```bash
pm2 list                      # Lihat semua proses
pm2 status sdms-backend       # Status backend
pm2 logs sdms-backend         # Lihat log realtime
pm2 logs sdms-backend --lines 100  # 100 baris terakhir
pm2 restart sdms-backend      # Restart backend
pm2 stop sdms-backend         # Stop backend
pm2 start sdms-backend        # Start backend
pm2 monit                     # Monitor CPU/RAM
```

---

## Troubleshooting di VPS

### Backend tidak bisa start
```bash
pm2 logs sdms-backend --err
```
Cek: `.env` sudah ada? MySQL berjalan? Port 3000 bebas?

### MySQL tidak bisa connect
```bash
systemctl status mariadb
mysql -u sdms_user -p sdms_master
```

### Nginx error
```bash
nginx -t
journalctl -u nginx --since "5 min ago"
```

### Port 3000 sudah terpakai
```bash
lsof -i :3000
kill -9 PID_YANG_TERTULIS
```

---

## Backup Database

```bash
# Backup manual
mysqldump -u sdms_user -p sdms_master > /backup/sdms_$(date +%Y%m%d).sql

# Restore
mysql -u sdms_user -p sdms_master < /backup/sdms_20240101.sql
```

Tambahkan ke crontab untuk backup otomatis tiap hari:
```bash
crontab -e
# Tambahkan baris ini:
0 2 * * * mysqldump -u sdms_user -pPASSWORD sdms_master > /backup/sdms_$(date +\%Y\%m\%d).sql
```

---

## Ringkasan Perintah Setelah Setiap Update Kode

```bash
cd /var/www/sdms
bash update.sh                   # Update otomatis (recommended)

# atau perintah manual:
git pull                          # Ambil update terbaru
bash deploy/update.sh             # Rebuild & restart otomatis
bash deploy/hot-reload.sh         # Quick restart tanpa git pull
```
