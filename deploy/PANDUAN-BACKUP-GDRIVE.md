# Panduan Instalasi Backup Otomatis ke Google Drive
## SDMS — VPS Linux + rclone + Crontab

---

## Gambaran Umum

Setiap hari jam **01:00 dini hari**, VPS akan otomatis:
1. Dump database `sdms_master` → dikompres jadi `.sql.gz`
2. Upload ke Google Drive dengan nama file **tetap** (menimpa file lama)
3. Log hasil ke `/var/log/sdms-backup.log`

> File di Google Drive tidak bertambah banyak — hanya 1 file yang selalu diperbarui.

---

## TAHAP 1 — Install rclone di VPS

SSH ke VPS, jalankan:

```bash
curl https://rclone.org/install.sh | sudo bash
```

Verifikasi:
```bash
rclone version
```
Harus muncul versi, contoh: `rclone v1.68.x`

---

## TAHAP 2 — Hubungkan rclone ke Google Drive

### Situasi A: VPS punya tampilan browser (jarang)
```bash
rclone config
```
Ikuti wizard, pilih Google Drive, login lewat browser.

---

### Situasi B: VPS tanpa browser (umum) ← ikuti ini

Prosesnya 2 bagian: **di VPS** dan **di laptop/komputer lokal**.

#### Bagian 1 — Di VPS

```bash
rclone config
```

Jawab wizard seperti ini:
```
No remotes found - make a new one
n/s/q> n

name> gdrive

Storage> drive
(ketik "drive" lalu Enter)

client_id>
(kosongkan, Enter)

client_secret>
(kosongkan, Enter)

scope> 1
(Full access)

root_folder_id>
(kosongkan, Enter)

service_account_file>
(kosongkan, Enter)

Edit advanced config?
n

Use auto config?
n                    ← PENTING: ketik n karena VPS tidak punya browser
```

VPS akan menampilkan perintah seperti ini — **copy perintahnya**:
```
Please go to the following link: https://...
Or run this on your local machine:
rclone authorize "drive" "xxxx..."
```

---

#### Bagian 2 — Di Laptop/Komputer Lokal

> Laptop harus sudah ada rclone. Install di Windows:
> ```
> winget install Rclone.Rclone
> ```

Paste dan jalankan perintah yang dikopi dari VPS tadi:
```bash
rclone authorize "drive" "xxxx..."
```

Browser akan terbuka → login dengan akun Google Drive → klik **Allow**.

Terminal laptop akan menampilkan **token** seperti ini:
```
Paste the following into your remote machine --->
{"access_token":"xxx","token_type":"Bearer","refresh_token":"xxx","expiry":"..."}
<---End paste
```

**Copy semua teks antara `--->`  dan `<---`** (termasuk kurung kurawal `{...}`).

---

#### Bagian 3 — Kembali ke VPS

Paste token yang baru dikopi ke prompt VPS:
```
Enter verification code>
(paste token, Enter)
```

```
Configure this as a Shared Drive (Team Drive)?
n

Keep this "gdrive" remote?
y

q    ← keluar dari config
```

---

### Verifikasi koneksi berhasil

```bash
rclone lsd gdrive:
```
Harus menampilkan daftar folder di Google Drive kamu.

---

## TAHAP 3 — Buat Folder di Google Drive

```bash
rclone mkdir gdrive:SDMS-Backup
```

Cek:
```bash
rclone lsd gdrive:SDMS-Backup
```

---

## TAHAP 4 — Siapkan Script Backup

### Buat folder log dan backup

```bash
sudo mkdir -p /var/backups/sdms
sudo touch /var/log/sdms-backup.log
sudo chmod 666 /var/log/sdms-backup.log
```

### Buat file script

```bash
sudo nano /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

Isi dengan (sesuaikan `DB_USER`, `DB_PASS`, `DB_NAME`):

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

# Backup database
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

    # Upload ke Google Drive (menimpa file lama)
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

## TAHAP 5 — Test Manual

Jalankan script sekali untuk memastikan berjalan:

```bash
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

Output yang diharapkan:
```
[2026-09-24 13:00:01] ====== SDMS Backup dimulai ======
[2026-09-24 13:00:03] Backup berhasil: /var/backups/sdms/backup_sdms_master.sql.gz (2.1M)
[2026-09-24 13:00:06] Upload Google Drive berhasil
[2026-09-24 13:00:06] ====== Selesai ======
```

Cek file muncul di Google Drive:
```bash
rclone ls gdrive:SDMS-Backup
```

---

## TAHAP 6 — Daftarkan Crontab Jam 01:00

```bash
crontab -e
```

Pilih editor (nano = ketik `1`, Enter), tambahkan baris ini di **paling bawah**:

```
0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1
```

Simpan: `Ctrl+X` → `Y` → `Enter`

### Verifikasi crontab terdaftar

```bash
crontab -l
```

Harus muncul baris yang baru ditambahkan.

---

## Monitoring & Maintenance

### Lihat log backup

```bash
# Log terbaru
tail -50 /var/log/sdms-backup.log

# Pantau live
tail -f /var/log/sdms-backup.log

# Cek apakah backup kemarin berhasil
grep "$(date -d yesterday '+%Y-%m-%d')" /var/log/sdms-backup.log
```

### Cek file di Google Drive

```bash
# Lihat file + ukuran + tanggal modifikasi
rclone lsl gdrive:SDMS-Backup
```

### Jalankan backup sekarang (tanpa tunggu jam 1)

```bash
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh
```

---

## Troubleshooting

### ❌ `mariadb-dump: command not found`
Coba ganti dengan `mysqldump`:
```bash
# Edit script, ganti mariadb-dump dengan:
mysqldump --no-tablespaces --single-transaction ...
```

### ❌ `Access denied for user 'root'`
Edit script, isi `DB_PASS` dengan password database yang benar, atau tambahkan opsi socket:
```bash
mariadb-dump --no-tablespaces --single-transaction \
  -u "$DB_USER" -p"$DB_PASS" \
  --socket=/var/run/mysqld/mysqld.sock "$DB_NAME" \
  | gzip > "$FILE_BACKUP"
```

### ❌ `Failed to create file system... didn't find section in config file`
Token rclone belum tersimpan atau expired. Ulangi Tahap 2:
```bash
rclone config reconnect gdrive:
```

### ❌ Upload gagal tapi backup lokal ada
Cek koneksi internet VPS dan coba upload manual:
```bash
rclone copyto /var/backups/sdms/backup_sdms_master.sql.gz \
  gdrive:SDMS-Backup/backup_sdms_master.sql.gz -v
```

---

## Ringkasan Perintah Instalasi (Copy-Paste Semua)

```bash
# 1. Install rclone
curl https://rclone.org/install.sh | sudo bash

# 2. Config Google Drive (ikuti wizard di atas)
rclone config

# 3. Buat folder GDrive
rclone mkdir gdrive:SDMS-Backup

# 4. Siapkan folder & log
sudo mkdir -p /var/backups/sdms
sudo touch /var/log/sdms-backup.log
sudo chmod 666 /var/log/sdms-backup.log

# 5. Beri izin script
chmod +x /var/www/sdms/deploy/backup-sdms-gdrive.sh

# 6. Test manual
bash /var/www/sdms/deploy/backup-sdms-gdrive.sh

# 7. Daftarkan crontab jam 01:00
(crontab -l 2>/dev/null; echo "0 1 * * * /bin/bash /var/www/sdms/deploy/backup-sdms-gdrive.sh >> /var/log/sdms-backup.log 2>&1") | crontab -

# 8. Verifikasi crontab
crontab -l
```

---

*SDMS — Backup otomatis database ke Google Drive, file menimpa setiap hari*
