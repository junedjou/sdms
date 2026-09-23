# 🗄️ Backup Otomatis Database ke Google Drive
### SDMS — Panduan Lengkap Setup di VPS Linux

> **Hasil akhir:** Database `sdms_master` otomatis di-backup setiap hari jam **01:00 dini hari**, dikompres, lalu diupload ke Google Drive. File di Google Drive **selalu menimpa yang lama** — tidak bertambah banyak.

---

## 📋 Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Install rclone di VPS](#2-install-rclone-di-vps)
3. [Buat OAuth Client ID Sendiri di Google Cloud](#3-buat-oauth-client-id-sendiri-di-google-cloud)
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
- Akun Google Drive (gratis 15GB sudah cukup)

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

## 3. Buat OAuth Client ID Sendiri di Google Cloud

> ⚠️ Wajib dilakukan — rclone shared client_id akan berhenti bekerja di 2026.

### A. Buat Project

1. Buka https://console.cloud.google.com
2. Klik **"Select a project"** → **"New Project"**
3. Nama project: `SDMS-Backup` → klik **Create**
4. Pastikan project `SDMS-Backup` aktif di dropdown atas

### B. Aktifkan Google Drive API

Buka link ini langsung:
```
https://console.cloud.google.com/apis/library/drive.googleapis.com
```
Klik **Enable**.

### C. Setup OAuth Consent Screen

1. Di menu kiri → **Google Auth Platform** → **Overview**
2. Klik **"Get started"**
3. Isi:
   - App name: `SDMS-Backup`
   - User support email: *(pilih email kamu)*
4. Klik **Next** terus sampai selesai → **Create**

### D. Tambahkan Test User

1. Di menu kiri → **Audience**
2. Scroll ke bagian **Test users**
3. Klik **+ Add users**
4. Masukkan email Google Drive kamu (contoh: `junedjou@gmail.com`)
5. Klik **Save**

> ⚠️ Jika tidak ditambahkan, akan muncul error `403: access_denied` saat authorize.

### E. Buat OAuth Client ID

1. Di menu kiri → **Clients**
2. Klik **"Create OAuth client"**
3. Application type: **Desktop app**
4. Name: `rclone`
5. Klik **Create**
6. **Catat Client ID dan Client Secret** — Client Secret tidak bisa dilihat lagi setelah dialog ditutup!

Contoh hasil:
```
Client ID     : 707458947749-xxxxxxxxxxxx.apps.googleusercontent.com
Client Secret : GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4. Hubungkan rclone ke Google Drive

> Proses ini butuh **2 terminal**: satu di VPS, satu di laptop lokal.

### Di VPS — Jalankan config

```bash
rclone config
```

Ikuti wizard berikut:

| Prompt | Jawaban |
|--------|---------|
| `n/s/q>` | `e` (edit existing) atau `n` (new) |
| `name>` | `gdrive` |
| `Storage>` | `drive` |
| `client_id>` | *(paste Client ID dari langkah 3E)* |
| `client_secret>` | *(paste Client Secret dari langkah 3E)* |
| `scope>` | `1` (full access) |
| `root_folder_id>` | *(Enter kosong)* |
| `service_account_file>` | *(Enter kosong)* |
| `Edit advanced config?` | `n` |
| `Token already configured - replace it?` | `y` |
| `Use web browser to automatically authenticate?` | `n` ← **penting!** |

VPS akan menampilkan perintah seperti ini — **copy perintahnya**:
```
Execute the following on the machine with the web browser:
rclone authorize "drive" "eyJjbGllbnRfaWQiOi..."
```

### Di Laptop Lokal — Authorize via Browser

> Install rclone di laptop dulu jika belum ada:
> - Windows: `winget install Rclone.Rclone`
> - Mac: `brew install rclone`

Buka PowerShell/Terminal di laptop, paste dan jalankan perintah dari VPS:
```bash
rclone authorize "drive" "eyJjbGllbnRfaWQiOi..."
```

Browser terbuka → login akun Google → klik **Allow**.

Terminal laptop menampilkan token:
```
Paste the following into your remote machine --->
{"access_token":"ya29.xxx","refresh_token":"1//xxx","expiry":"..."}
<---End paste
```

**Copy semua teks antara `-->` dan `<--`** (termasuk `{` dan `}`).

### Kembali ke VPS — Paste Token

```
config_token> {"access_token":"ya29.xxx",...}
```

Lanjut:

| Prompt | Jawaban |
|--------|---------|
| `Configure this as a Shared Drive?` | `n` |
| `Keep this "gdrive" remote?` | `y` |
| `q` | keluar dari config |

### Verifikasi Koneksi

```bash
rclone lsd gdrive:
# Harus muncul daftar folder Google Drive — tanpa peringatan shared client_id
```

---

## 5. Siapkan Script Backup

### Buat folder dan file log

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

Isi dengan:

```bash
#!/bin/bash

# ============================================================
#  SDMS - Backup Database + Upload ke Google Drive
#  Crontab: 0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1
# ============================================================

DB_USER="root"
DB_PASS=""                              # Isi jika ada password
DB_NAME="sdms_master"

BACKUP_DIR="/var/backups/sdms"
GDRIVE_FOLDER="gdrive:SDMS-Backup"

# Nama file TETAP — selalu menimpa file lama di Google Drive
FILE_BACKUP="${BACKUP_DIR}/backup_sdms_master.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] ====== SDMS Backup dimulai ======"

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

```bash
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

Output sukses:
```
[2026-09-23 02:49:18] ====== SDMS Backup dimulai ======
[2026-09-23 02:49:18] Backup berhasil: /var/backups/sdms/backup_sdms_master.sql.gz (288K)
[2026-09-23 02:49:31] Upload Google Drive berhasil
[2026-09-23 02:49:31] ====== Selesai ======
```

Cek file di Google Drive:
```bash
rclone lsl gdrive:SDMS-Backup
# Output: 293981 2026-09-23 02:49:18.xxx backup_sdms_master.sql.gz
```

---

## 7. Daftarkan Crontab Jam 01:00

```bash
(crontab -l 2>/dev/null; echo "0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1") | crontab -
```

Verifikasi:
```bash
crontab -l
# Output: 0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1
```

---

## 8. Monitoring

### Cek log backup

```bash
# Log terbaru
tail -20 /var/log/sdms-backup.log

# Pantau live
tail -f /var/log/sdms-backup.log

# Cek apakah backup kemarin berhasil
grep "$(date -d yesterday '+%Y-%m-%d')" /var/log/sdms-backup.log
```

### Cek file di Google Drive

```bash
rclone lsl gdrive:SDMS-Backup
```

### Jalankan backup sekarang (tanpa tunggu jam 1)

```bash
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

### Ganti jadwal crontab

```bash
crontab -e
# Edit angka jam sesuai kebutuhan
# Format: menit jam * * *
# Contoh jam 02:30: 30 2 * * *
```

---

## 9. Troubleshooting

### ❌ `mariadb-dump: command not found`
```bash
# Ganti mariadb-dump dengan mysqldump di script
sed -i 's/mariadb-dump/mysqldump/g' /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

### ❌ `Access denied for user 'root'`
Isi `DB_PASS` di script dengan password database yang benar:
```bash
nano /var/www/sdms/deploy/backup-sdms-gdrive.sh
# Ubah: DB_PASS="password_database_kamu"
```

### ❌ `403: access_denied` saat authorize browser
Email belum didaftarkan sebagai test user. Buka:
```
https://console.cloud.google.com/auth/audience
```
Tambahkan email Google kamu di bagian **Test users**.

### ❌ `didn't find section in config file`
Token expired atau config hilang. Re-authorize:
```bash
rclone config reconnect gdrive:
```

### ❌ Upload gagal tapi backup lokal ada
Test upload manual dengan verbose:
```bash
rclone copyto /var/backups/sdms/backup_sdms_master.sql.gz \
  gdrive:SDMS-Backup/backup_sdms_master.sql.gz -v
```

---

## 📁 Struktur File

```
/var/www/sdms/deploy/
└── backup-sdms-gdrive.sh     ← Script backup utama

/var/backups/sdms/
└── backup_sdms_master.sql.gz ← File backup lokal (ditimpa tiap hari)

/var/log/
└── sdms-backup.log           ← Log setiap eksekusi

Google Drive/
└── SDMS-Backup/
    └── backup_sdms_master.sql.gz  ← File di cloud (ditimpa tiap hari)
```

---

## ⚡ Ringkasan Perintah Instalasi (Copy-Paste Semua)

```bash
# 1. Install rclone
curl https://rclone.org/install.sh | sudo bash

# 2. Config rclone ke Google Drive (ikuti wizard interaktif)
rclone config

# 3. Buat folder di Google Drive
rclone mkdir gdrive:SDMS-Backup

# 4. Siapkan folder backup dan log
sudo mkdir -p /var/backups/sdms
sudo touch /var/log/sdms-backup.log
sudo chmod 666 /var/log/sdms-backup.log

# 5. Buat dan isi script (nano, lalu paste isi script)
mkdir -p /var/www/sdms/deploy
nano /var/www/sdms/deploy/backup-sdms-gdrive.sh

# 6. Beri izin eksekusi
chmod +x /var/www/sdms/deploy/backup-sdms-gdrive.sh

# 7. Test manual
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh

# 8. Daftarkan crontab jam 01:00
(crontab -l 2>/dev/null; echo "0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1") | crontab -

# 9. Verifikasi
crontab -l
```

---

*SDMS — Sistem Data Manajemen Sekolah*  
*Backup otomatis database ke Google Drive, file menimpa setiap hari jam 01:00*
