# Panduan Setup Backup Otomatis ke Google Drive
## SDMS — rclone + Windows Task Scheduler

---

## Daftar Isi
1. [Install rclone](#1-install-rclone)
2. [Hubungkan rclone ke Google Drive](#2-hubungkan-rclone-ke-google-drive)
3. [Test Koneksi](#3-test-koneksi)
4. [Daftarkan Jadwal Otomatis](#4-daftarkan-jadwal-otomatis)
5. [Uji Coba Manual](#5-uji-coba-manual)
6. [Cek Log & Monitoring](#6-cek-log--monitoring)
7. [Konfigurasi Lanjutan](#7-konfigurasi-lanjutan)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Install rclone

### Cara Cepat (PowerShell — Recommended)
Buka **PowerShell sebagai Administrator**, jalankan:

```powershell
winget install Rclone.Rclone
```

Jika `winget` tidak tersedia, download manual:

1. Buka https://rclone.org/downloads/
2. Download **Windows - amd64** (file `.zip`)
3. Ekstrak, letakkan `rclone.exe` di `C:\rclone\rclone.exe`
4. Tambah ke PATH (optional tapi direkomendasikan):
   - Buka **System Properties → Environment Variables**
   - Di **System variables**, klik `Path` → Edit → New
   - Tambahkan: `C:\rclone`

### Verifikasi instalasi
```powershell
rclone version
```
Output harus menampilkan versi rclone, contoh: `rclone v1.68.x`

---

## 2. Hubungkan rclone ke Google Drive

### Langkah-langkah

**Buka PowerShell/CMD, jalankan:**
```
rclone config
```

Ikuti urutan berikut di prompt interaktif:

```
No remotes found, make a new one? → ketik: n → Enter

name> gdrive                          ← nama remote (harus sama dengan script!)

Storage> drive                        ← pilih Google Drive
         (ketik "drive" atau nomor yang sesuai)

client_id>                            ← kosongkan, Enter
client_secret>                        ← kosongkan, Enter

scope> 1                              ← Full access to all files

root_folder_id>                       ← kosongkan, Enter
service_account_file>                 ← kosongkan, Enter

Edit advanced config? n               ← ketik n, Enter

Use auto config? y                    ← ketik y, Enter
```

> Browser akan terbuka otomatis. **Login dengan akun Google Drive** yang ingin dipakai untuk menyimpan backup.

```
Configure this as a Shared Drive? n   ← ketik n (kecuali pakai Shared Drive)

Keep this "gdrive" remote? y          ← ketik y, Enter

q                                     ← keluar dari config
```

### Verifikasi remote berhasil dibuat
```powershell
rclone listremotes
```
Output harus ada: `gdrive:`

---

## 3. Test Koneksi

### Cek isi Google Drive
```powershell
rclone lsd gdrive:
```
Harus menampilkan daftar folder di root Google Drive kamu.

### Buat folder SDMS-Backup di GDrive
```powershell
rclone mkdir gdrive:SDMS-Backup
```

### Test upload file kecil
```powershell
echo "test" > test.txt
rclone copy test.txt gdrive:SDMS-Backup/
rclone ls gdrive:SDMS-Backup/
Remove-Item test.txt
```

Jika `test.txt` muncul di output `rclone ls`, berarti koneksi berhasil.

---

## 4. Daftarkan Jadwal Otomatis

### Cara mudah (klik file)
1. Klik kanan `daftar-task-scheduler-gdrive.bat`
2. Pilih **Run as Administrator**
3. Konfirmasi `[OK]` pada output

### Cara manual via PowerShell (Admin)
```powershell
schtasks /create `
  /tn "SDMS-Backup-GDrive" `
  /tr "powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Hidden -File `"d:\WEBSITE\sdms\backup\backup-gdrive.ps1`"" `
  /sc daily `
  /st 01:00 `
  /ru SYSTEM `
  /rl HIGHEST `
  /f
```

### Verifikasi task terdaftar
```powershell
schtasks /query /tn "SDMS-Backup-GDrive" /fo LIST
```

---

## 5. Uji Coba Manual

### Opsi A — Klik file
Double-click `test-backup-gdrive.bat` (tidak perlu Admin)

### Opsi B — PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File "d:\WEBSITE\sdms\backup\backup-gdrive.ps1"
```

### Opsi C — Jalankan task sekarang
```powershell
schtasks /run /tn "SDMS-Backup-GDrive"
```

Setelah selesai, cek di Google Drive folder `SDMS-Backup` — harus ada file `.zip` dengan nama seperti:
```
sdms_20260923_010005_auto.zip
```

---

## 6. Cek Log & Monitoring

### Lokasi log
```
d:\WEBSITE\sdms\backup\logs\backup-gdrive.log
```

### Lihat log terbaru (PowerShell)
```powershell
Get-Content "d:\WEBSITE\sdms\backup\logs\backup-gdrive.log" -Tail 50
```

### Contoh output log sukses
```
[2026-09-24 01:00:01][INFO] ====== SDMS Backup + GDrive Upload dimulai ======
[2026-09-24 01:00:01][INFO] Backup database 'sdms_master' ke: sdms_20260924_010001_auto.sql
[2026-09-24 01:00:03][OK]   Backup berhasil! Ukuran: 2847.3 KB
[2026-09-24 01:00:03][OK]   Kompres berhasil: 2847.3 KB → 312.1 KB (hemat 89%)
[2026-09-24 01:00:05][INFO] Upload: sdms_20260924_010001_auto.zip → GDrive/SDMS-Backup/
[2026-09-24 01:00-08][OK]   Upload berhasil
[2026-09-24 01:00:08][OK]   Tidak ada backup lokal lama yang perlu dihapus
[2026-09-24 01:00:09][OK]   Bersihkan GDrive selesai
[2026-09-24 01:00:09][OK]   ====== Selesai dalam 8.2 detik ======
```

### Cek file di Google Drive via CLI
```powershell
rclone ls gdrive:SDMS-Backup
```

---

## 7. Konfigurasi Lanjutan

Semua pengaturan ada di bagian atas file `backup-gdrive.ps1`:

| Variabel | Default | Keterangan |
|---|---|---|
| `$XAMPP_DIR` | `C:\xampp` | Lokasi XAMPP |
| `$MYSQL_USER` | `root` | User MySQL |
| `$MYSQL_PASS` | `""` | Password MySQL (kosong = default XAMPP) |
| `$DB_NAME` | `sdms_master` | Nama database |
| `$BACKUP_DIR` | `.\files` | Folder backup lokal |
| `$GDRIVE_REMOTE` | `gdrive` | Nama remote rclone |
| `$GDRIVE_FOLDER` | `SDMS-Backup` | Nama folder di Google Drive |
| `$KEEP_LOCAL_DAYS` | `7` | Simpan backup lokal berapa hari |
| `$KEEP_CLOUD_DAYS` | `30` | Simpan backup di GDrive berapa hari |

### Ganti jadwal jam (misal jam 02:00)
```powershell
schtasks /change /tn "SDMS-Backup-GDrive" /st 02:00
```

### Hapus / nonaktifkan task
```powershell
# Nonaktifkan (task tetap ada, tidak jalan)
schtasks /change /tn "SDMS-Backup-GDrive" /disable

# Aktifkan kembali
schtasks /change /tn "SDMS-Backup-GDrive" /enable

# Hapus permanen
schtasks /delete /tn "SDMS-Backup-GDrive" /f
```

---

## 8. Troubleshooting

### ❌ "rclone tidak ditemukan"
- Pastikan `rclone.exe` ada di `C:\rclone\` atau sudah di PATH
- Coba: `Get-Command rclone` di PowerShell

### ❌ "mysqldump tidak ditemukan"
- Pastikan XAMPP sudah terinstall dan MySQL module diaktifkan
- Edit variabel `$XAMPP_DIR` di `backup-gdrive.ps1` sesuai lokasi XAMPP kamu

### ❌ Upload gagal / token expired
Token Google Drive bisa expire. Refresh dengan:
```powershell
rclone config reconnect gdrive:
```
Browser akan terbuka, login ulang.

### ❌ Task Scheduler tidak jalan saat komputer sleep
Task berjalan dengan user `SYSTEM` jadi tidak perlu login, tapi komputer harus **menyala dan tidak hibernate**. Pastikan power plan Windows tidak mematikan komputer jam 1 malam.

Setting power plan:
- Control Panel → Power Options → Change plan settings
- Pastikan **Turn off the computer** diset ke **Never**

### ❌ Script ditolak karena ExecutionPolicy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### ❌ File backup kosong (< 1 KB)
- Cek apakah MySQL sudah aktif di XAMPP Control Panel
- Test koneksi: `mysql -u root -h 127.0.0.1 sdms_master -e "SHOW TABLES;"`

---

## Ringkasan File Backup

```
backup\
├── backup-gdrive.ps1              ← Script utama (backup + upload)
├── test-backup-gdrive.bat         ← Uji coba manual (double-click)
├── daftar-task-scheduler-gdrive.bat ← Daftarkan jadwal jam 01:00
├── setup-rclone-gdrive.md         ← Panduan ini
├── files\                         ← File backup lokal (.zip)
│   └── sdms_YYYYMMDD_HHMMSS_auto.zip
└── logs\
    └── backup-gdrive.log          ← Log setiap eksekusi
```

---

*Dibuat untuk SDMS — Sistem Data Manajemen Sekolah*
