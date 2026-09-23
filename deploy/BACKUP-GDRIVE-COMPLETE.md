# 🗄️ Backup Otomatis Database ke Google Drive
### SDMS — Panduan Lengkap Setup di VPS Linux

> **Hasil akhir:** Database `sdms_master` otomatis di-backup setiap hari jam **01:00 dini hari**, dikompres `.sql.gz`, lalu diupload ke Google Drive. File di Google Drive **selalu menimpa yang lama** — tidak bertambah banyak. Berjalan **selamanya** tanpa perlu login ulang karena pakai OAuth Client ID sendiri.

---

## 📋 Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Install rclone di VPS](#2-install-rclone-di-vps)
3. [Buat OAuth Client ID di Google Cloud](#3-buat-oauth-client-id-di-google-cloud)
4. [Hubungkan rclone ke Google Drive](#4-hubungkan-rclone-ke-google-drive)
5. [Siapkan Script Backup](#5-siapkan-script-backup)
6. [Test Manual](#6-test-manual)
7. [Daftarkan Crontab Jam 01:00](#7-daftarkan-crontab-jam-0100)
8. [Monitoring](#8-monitoring)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prasyarat

- VPS Linux (Ubuntu/Debian) dengan akses root
- MariaDB/MySQL sudah berjalan
- Database `sdms_master` sudah ada
- Laptop/komputer lokal dengan browser untuk proses authorize Google
- Akun Google (Google Drive gratis 15GB sudah cukup)
- rclone terinstall di laptop lokal (untuk proses authorize)

---

## 2. Install rclone di VPS

SSH ke VPS, jalankan:

```bash
curl https://rclone.org/install.sh | sudo bash
```

Verifikasi:
```bash
rclone version
# Output: rclone v1.68.x atau lebih baru
```

---

## 3. Buat OAuth Client ID di Google Cloud

> ⚠️ **Wajib dilakukan** — rclone shared client_id akan berhenti bekerja di 2026. Dengan Client ID sendiri, koneksi berjalan **selamanya** tanpa batas.

### A. Buat Project Baru

1. Buka https://console.cloud.google.com
2. Klik **"Select a project"** di pojok kiri atas
3. Klik **"New Project"**
4. Isi:
   - Project name: `SDMS-Backup`
5. Klik **Create**
6. Tunggu sebentar, lalu pastikan project **SDMS-Backup** aktif di dropdown atas

### B. Aktifkan Google Drive API

1. Buka link ini langsung (pastikan project SDMS-Backup aktif):
   ```
   https://console.cloud.google.com/apis/library/drive.googleapis.com
   ```
2. Klik tombol **Enable**
3. Tunggu sampai halaman berubah menampilkan dashboard API

### C. Setup OAuth Consent Screen

1. Di menu kiri → klik **"Google Auth Platform"** → **"Overview"**
2. Klik tombol **"Get started"**
3. Isi form:
   - App name: `SDMS-Backup`
   - User support email: *(pilih email kamu dari dropdown)*
4. Klik **Next**
5. Di halaman Audience → pilih **External**
6. Klik **Next** terus sampai selesai → klik **Create**
7. Akan muncul halaman **OAuth Overview** — konfigurasi berhasil

### D. Tambahkan Test User (WAJIB)

> Tanpa langkah ini akan muncul error `403: access_denied` saat authorize.

1. Di menu kiri → klik **"Audience"**
2. Scroll ke bawah ke bagian **"Test users"**
3. Klik **"+ Add users"**
4. Masukkan email Google Drive yang akan dipakai menyimpan backup
   - Contoh: `junedjou@gmail.com`
5. Klik **Save**
6. Pastikan email sudah muncul di daftar Test users

### E. Buat OAuth Client ID

1. Di menu kiri → klik **"Clients"**
2. Klik tombol **"Create OAuth client"**
3. Isi:
   - Application type: **Desktop app**
   - Name: `rclone`
4. Klik **Create**
5. Akan muncul popup **"OAuth client created"** berisi:
   - **Client ID** — contoh: `707458947749-xxxx.apps.googleusercontent.com`
   - **Client Secret** — contoh: `GOCSPX-xxxxxxxxxxxxxxxxx`

> ⚠️ **Catat/copy keduanya sekarang!** Client Secret tidak bisa dilihat lagi setelah popup ditutup.
> Kalau lupa, bisa klik nama client di daftar → Download JSON untuk melihat ulang.

6. Klik **OK**

---

## 4. Hubungkan rclone ke Google Drive

> Proses ini butuh **2 terminal**: satu di VPS, satu di laptop lokal (karena VPS tidak punya browser).

### Install rclone di Laptop Lokal (jika belum ada)

- **Windows PowerShell:**
  ```powershell
  winget install Rclone.Rclone
  ```
  Setelah install, tutup PowerShell dan buka lagi.

- **Mac Terminal:**
  ```bash
  brew install rclone
  ```

### Di VPS — Mulai Config

```bash
rclone config
```

Jawab setiap pertanyaan seperti tabel berikut:

| Prompt | Jawaban | Keterangan |
|--------|---------|------------|
| `n/s/q>` | `n` | Buat remote baru |
| `name>` | `gdrive` | Nama remote — harus `gdrive` |
| `Storage>` | `drive` | Pilih Google Drive |
| `client_id>` | *(paste Client ID dari langkah 3E)* | |
| `client_secret>` | *(paste Client Secret dari langkah 3E)* | |
| `scope>` | `1` | Full access to all files |
| `root_folder_id>` | *(Enter kosong)* | |
| `service_account_file>` | *(Enter kosong)* | |
| `Edit advanced config?` | `n` | |
| `Continue using shared client_id?` | `y` | Jika muncul |
| `Use web browser to authenticate?` | `n` | **Penting! VPS tidak punya browser** |

Setelah ketik `n` di pertanyaan terakhir, VPS menampilkan perintah seperti ini — **copy seluruh perintahnya**:

```
Execute the following on the machine with the web browser:

    rclone authorize "drive" "eyJjbGllbnRfaWQiOi..."

Then paste the result.

Enter a value.
config_token>
```

**Jangan tutup terminal VPS — biarkan menunggu.**

### Di Laptop Lokal — Authorize via Browser

Buka PowerShell/Terminal di laptop, paste dan jalankan perintah yang dikopi dari VPS:

```bash
rclone authorize "drive" "eyJjbGllbnRfaWQiOi..."
```

Browser terbuka otomatis → **login dengan email yang sudah didaftarkan sebagai test user** → klik **Allow/Izinkan**.

Terminal laptop menampilkan token JSON seperti ini:

```
Paste the following into your remote machine --->
{"access_token":"ya29.xxx","token_type":"Bearer","refresh_token":"1//xxx","expiry":"2026-..."}
<---End paste
```

**Copy semua teks antara `-->` dan `<--`** (termasuk kurung kurawal `{` dan `}`).

### Kembali ke VPS — Paste Token

Paste token yang baru dikopi ke prompt VPS:

```
config_token> {"access_token":"ya29.xxx","refresh_token":"1//xxx",...}
```

Tekan **Enter**, lanjut jawab:

| Prompt | Jawaban |
|--------|---------|
| `Configure this as a Shared Drive?` | `n` |
| `Keep this "gdrive" remote?` | `y` |
| `q` | Ketik `q` lalu Enter untuk keluar |

### Verifikasi Koneksi Berhasil

```bash
rclone lsd gdrive:
```

✅ Berhasil jika muncul daftar folder Google Drive **tanpa peringatan** `shared client_id`.

### Buat Folder di Google Drive

```bash
rclone mkdir gdrive:SDMS-Backup
```

---

## 5. Siapkan Script Backup

### Buat folder backup dan file log

```bash
sudo mkdir -p /var/backups/sdms
sudo touch /var/log/sdms-backup.log
sudo chmod 666 /var/log/sdms-backup.log
```

### Buat script

```bash
mkdir -p /var/www/sdms/deploy
nano /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

Copy-paste isi berikut ke dalam nano (sesuaikan `DB_USER`, `DB_PASS`, `DB_NAME` jika berbeda):

```bash
#!/bin/bash

# ============================================================
#  SDMS - Backup Database + Upload ke Google Drive
#  Crontab: 0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1
# ============================================================

DB_USER="root"
DB_PASS=""                              # Isi jika ada password database
DB_NAME="sdms_master"

BACKUP_DIR="/var/backups/sdms"
GDRIVE_FOLDER="gdrive:SDMS-Backup"

# Nama file TETAP — selalu menimpa file lama di Google Drive
FILE_BACKUP="${BACKUP_DIR}/backup_sdms_master.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ====== SDMS Backup dimulai ======"

# Backup database — kompres langsung via pipe
if [ -n "$DB_PASS" ]; then
    mariadb-dump --no-tablespaces --single-transaction \
      -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
      | gzip > "$FILE_BACKUP"
else
    mariadb-dump --no-tablespaces --single-transaction \
      -u "$DB_USER" "$DB_NAME" \
      | gzip > "$FILE_BACKUP"
fi

if [ $? -eq 0 ]; then
    SIZE=$(du -sh "$FILE_BACKUP" | cut -f1)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup berhasil: $FILE_BACKUP ($SIZE)"

    # Upload ke Google Drive — menimpa file lama
    rclone copyto "$FILE_BACKUP" "$GDRIVE_FOLDER/backup_sdms_master.sql.gz"

    if [ $? -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Upload Google Drive berhasil"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Upload Google Drive GAGAL"
        exit 2
    fi
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup GAGAL"
    exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ====== Selesai ======"
```

Simpan: `Ctrl+X` → `Y` → `Enter`

### Beri izin eksekusi

```bash
chmod +x /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

---

## 6. Test Manual

Jalankan script sekali untuk memastikan semua berjalan:

```bash
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

Output yang diharapkan:
```
[2026-09-23 02:49:18] ====== SDMS Backup dimulai ======
[2026-09-23 02:49:18] Backup berhasil: /var/backups/sdms/backup_sdms_master.sql.gz (288K)
[2026-09-23 02:49:31] Upload Google Drive berhasil
[2026-09-23 02:49:31] ====== Selesai ======
```

Verifikasi file muncul di Google Drive:
```bash
rclone lsl gdrive:SDMS-Backup
# Output: 293981 2026-09-23 02:49:18.xxx backup_sdms_master.sql.gz
```

---

## 7. Daftarkan Crontab Jam 01:00

Jalankan perintah ini untuk mendaftarkan jadwal otomatis:

```bash
(crontab -l 2>/dev/null; echo "0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1") | crontab -
```

Verifikasi terdaftar:
```bash
crontab -l
```

Output harus muncul:
```
0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1
```

✅ **Selesai! Backup akan berjalan otomatis setiap hari jam 01:00 dini hari.**

---

## 8. Monitoring

### Cek log backup

```bash
# Lihat 20 baris log terbaru
tail -20 /var/log/sdms-backup.log

# Pantau live saat backup berjalan
tail -f /var/log/sdms-backup.log

# Cek apakah backup kemarin berhasil
grep "$(date -d yesterday '+%Y-%m-%d')" /var/log/sdms-backup.log
```

### Cek file di Google Drive

```bash
# Lihat nama file + ukuran + tanggal terakhir update
rclone lsl gdrive:SDMS-Backup
```

### Jalankan backup sekarang (tanpa tunggu jam 1)

```bash
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

### Ganti jadwal jam

```bash
crontab -e
# Ubah angka: menit jam * * *
# Jam 02:00  → 0 2 * * *
# Jam 00:30  → 30 0 * * *
```

---

## 9. Troubleshooting

### ❌ `mariadb-dump: command not found`

```bash
# Ganti dengan mysqldump
sed -i 's/mariadb-dump/mysqldump/g' /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

### ❌ `Access denied for user 'root'`

Edit script, isi password database:
```bash
nano /var/www/sdms/deploy/backup-sdms-gdrive.sh
# Ubah: DB_PASS="password_database_kamu"
```

Atau coba dengan socket:
```bash
# Tambahkan opsi --socket di dalam script:
mariadb-dump --no-tablespaces --single-transaction \
  --socket=/var/run/mysqld/mysqld.sock \
  -u "$DB_USER" "$DB_NAME" | gzip > "$FILE_BACKUP"
```

### ❌ `403: access_denied` saat authorize browser

Email belum didaftarkan sebagai test user. Buka:
```
https://console.cloud.google.com/auth/audience
```
Tambahkan email di bagian **Test users** → Save → ulangi proses authorize.

### ❌ Peringatan `shared client_id` masih muncul

Client ID belum terpasang dengan benar. Edit config rclone:
```bash
rclone config
# Pilih: e (edit existing remote)
# Pilih: gdrive
# Isi ulang client_id dan client_secret
```

### ❌ Token expired / upload tiba-tiba gagal

Re-authorize rclone (tidak perlu setup ulang dari awal):
```bash
rclone config reconnect gdrive:
```
Ikuti proses authorize seperti di Tahap 4 (jalankan `rclone authorize` di laptop → paste token ke VPS).

### ❌ File backup kosong (< 1KB)

Cek apakah MariaDB berjalan:
```bash
systemctl status mariadb
# atau
systemctl status mysql
```

Test koneksi database manual:
```bash
mariadb -u root -e "SHOW DATABASES;"
```

---

## 📁 Struktur File

```
/var/www/sdms/deploy/
└── backup-sdms-gdrive.sh          ← Script backup utama

/var/backups/sdms/
└── backup_sdms_master.sql.gz      ← File backup lokal (ditimpa tiap hari)

/var/log/
└── sdms-backup.log                ← Log setiap eksekusi

Google Drive/
└── SDMS-Backup/
    └── backup_sdms_master.sql.gz  ← File di cloud (ditimpa tiap hari)

Google Cloud Console/
└── Project: SDMS-Backup
    ├── Google Drive API: Enabled
    ├── OAuth Consent Screen: External
    ├── Test User: junedjou@gmail.com
    └── OAuth Client: rclone (Desktop app)
```

---

## ⚡ Ringkasan Semua Perintah (Copy-Paste Berurutan)

```bash
# ── TAHAP 1: Install rclone ──────────────────────────────
curl https://rclone.org/install.sh | sudo bash
rclone version

# ── TAHAP 2: Siapkan folder ──────────────────────────────
sudo mkdir -p /var/backups/sdms
sudo touch /var/log/sdms-backup.log
sudo chmod 666 /var/log/sdms-backup.log
mkdir -p /var/www/sdms/deploy

# ── TAHAP 3: Buat script backup ──────────────────────────
nano /var/www/sdms/deploy/backup-sdms-gdrive.sh
# (paste isi script dari Tahap 5, simpan Ctrl+X → Y → Enter)

chmod +x /var/www/sdms/deploy/backup-sdms-gdrive.sh

# ── TAHAP 4: Config rclone ke Google Drive ───────────────
# (Buat OAuth Client ID dulu di console.cloud.google.com — lihat Tahap 3)
rclone config
# Ikuti wizard: n → gdrive → drive → isi client_id → client_secret
# → n (no advanced) → n (no browser) → copy perintah authorize ke laptop
# → paste token dari laptop → n (no shared drive) → y (keep) → q (quit)

# ── TAHAP 5: Buat folder di Google Drive ─────────────────
rclone mkdir gdrive:SDMS-Backup

# ── TAHAP 6: Test manual ─────────────────────────────────
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh

# ── TAHAP 7: Daftarkan crontab jam 01:00 ─────────────────
(crontab -l 2>/dev/null; echo "0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1") | crontab -

# Verifikasi
crontab -l

# ── TAHAP 8: Cek log keesokan harinya ────────────────────
tail -20 /var/log/sdms-backup.log
rclone lsl gdrive:SDMS-Backup
```

---

*SDMS — Sistem Data Manajemen Sekolah*
*Backup otomatis database ke Google Drive, file menimpa setiap hari jam 01:00*
*Menggunakan OAuth Client ID sendiri — berjalan selamanya tanpa perlu login ulang*
