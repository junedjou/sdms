# ============================================================
#  SDMS Backup + Upload ke Google Drive via rclone
#  Jadwal: Tiap hari jam 01:00 (diatur via Task Scheduler)
#  Lokasi script: d:\WEBSITE\sdms\backup\backup-gdrive.ps1
# ============================================================

# ============================================================
# KONFIGURASI — Sesuaikan sebelum dipakai
# ============================================================
$XAMPP_DIR       = "C:\xampp"
$MYSQL_HOST      = "127.0.0.1"
$MYSQL_PORT      = "3306"
$MYSQL_USER      = "root"
$MYSQL_PASS      = ""                        # Kosong jika tidak ada password
$DB_NAME         = "sdms_master"

$BACKUP_DIR      = "$PSScriptRoot\files"     # Folder lokal penyimpanan backup
$GDRIVE_REMOTE   = "gdrive"                  # Nama remote rclone (hasil rclone config)
$GDRIVE_FOLDER   = "SDMS-Backup"             # Nama folder di Google Drive
$KEEP_LOCAL_DAYS = 7                         # Simpan backup lokal berapa hari
$KEEP_CLOUD_DAYS = 30                        # Simpan backup di GDrive berapa hari
$LOG_FILE        = "$PSScriptRoot\logs\backup-gdrive.log"
# ============================================================

# ── Warna helper ───────────────────────────────────────────
function Write-OK    { param($m) Write-Host "  [OK] $m"    -ForegroundColor Green  }
function Write-ERR   { param($m) Write-Host "  [!!] $m"    -ForegroundColor Red    }
function Write-INFO  { param($m) Write-Host "  [>>] $m"    -ForegroundColor Yellow }
function Write-HEAD  { param($m) Write-Host "`n$('='*55)`n  $m`n$('='*55)" -ForegroundColor Cyan }

# ── Logging ────────────────────────────────────────────────
function Write-Log {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp][$Level] $Message"
    Add-Content -Path $LOG_FILE -Value $line -Encoding UTF8
    switch ($Level) {
        "OK"    { Write-OK $Message }
        "ERROR" { Write-ERR $Message }
        default { Write-INFO $Message }
    }
}

# ── Cari mysqldump ─────────────────────────────────────────
function Find-Mysqldump {
    $candidates = @(
        "$XAMPP_DIR\mysql\bin\mysqldump.exe",
        "C:\xampp\mysql\bin\mysqldump.exe",
        "D:\xampp\mysql\bin\mysqldump.exe",
        "C:\laragon\bin\mysql\mysql-8.0\bin\mysqldump.exe",
        "C:\laragon\bin\mariadb\mariadb-10.6\bin\mysqldump.exe",
        "C:\laragon\bin\mariadb\mariadb-10.11\bin\mysqldump.exe",
        "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqldump.exe"
    )
    foreach ($p in $candidates) {
        if (Test-Path $p) { return $p }
    }
    # Coba via PATH
    $fromPath = Get-Command mysqldump -ErrorAction SilentlyContinue
    if ($fromPath) { return $fromPath.Source }
    return $null
}

# ── Cari rclone ────────────────────────────────────────────
function Find-Rclone {
    # Lokasi umum instalasi rclone di Windows
    $candidates = @(
        "C:\rclone\rclone.exe",
        "C:\Program Files\rclone\rclone.exe",
        "$env:USERPROFILE\rclone\rclone.exe",
        "$env:LOCALAPPDATA\rclone\rclone.exe"
    )
    foreach ($p in $candidates) {
        if (Test-Path $p) { return $p }
    }
    $fromPath = Get-Command rclone -ErrorAction SilentlyContinue
    if ($fromPath) { return $fromPath.Source }
    return $null
}

# ── Buat folder jika belum ada ─────────────────────────────
function Ensure-Directory {
    param($Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

# ── Step 1: Backup Database ────────────────────────────────
function Invoke-DatabaseBackup {
    Write-HEAD "Step 1: Backup Database MySQL"

    $mysqldump = Find-Mysqldump
    if (-not $mysqldump) {
        Write-Log "mysqldump tidak ditemukan! Pastikan XAMPP/Laragon terinstall." "ERROR"
        return $null
    }
    Write-Log "Menggunakan: $mysqldump"

    Ensure-Directory $BACKUP_DIR

    $timestamp   = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile  = "$BACKUP_DIR\sdms_${timestamp}_auto.sql"

    # Bangun argumen mysqldump
    $dumpArgs = @(
        "--host=$MYSQL_HOST",
        "--port=$MYSQL_PORT",
        "--user=$MYSQL_USER",
        "--single-transaction",
        "--routines",
        "--triggers",
        "--events",
        "--add-drop-table",
        "--complete-insert",
        "--result-file=$backupFile",
        $DB_NAME
    )
    if ($MYSQL_PASS -ne "") {
        $dumpArgs += "--password=$MYSQL_PASS"
    }

    Write-Log "Backup database '$DB_NAME' ke: $(Split-Path $backupFile -Leaf)"

    try {
        $proc = Start-Process -FilePath $mysqldump `
                              -ArgumentList $dumpArgs `
                              -Wait -PassThru -NoNewWindow `
                              -RedirectStandardError "$env:TEMP\mysqldump_err.txt"

        if ($proc.ExitCode -ne 0) {
            $errMsg = Get-Content "$env:TEMP\mysqldump_err.txt" -Raw -ErrorAction SilentlyContinue
            Write-Log "mysqldump gagal (exit $($proc.ExitCode)): $errMsg" "ERROR"
            return $null
        }

        # Validasi ukuran file
        if (-not (Test-Path $backupFile)) {
            Write-Log "File backup tidak terbuat!" "ERROR"
            return $null
        }
        $sizeKB = [math]::Round((Get-Item $backupFile).Length / 1KB, 1)
        if ($sizeKB -lt 1) {
            Write-Log "File backup terlalu kecil ($sizeKB KB) — mungkin database kosong atau error" "ERROR"
            return $null
        }

        Write-Log "Backup berhasil! Ukuran: $sizeKB KB → $(Split-Path $backupFile -Leaf)" "OK"
        return $backupFile

    } catch {
        Write-Log "Exception saat backup: $_" "ERROR"
        return $null
    }
}

# ── Step 2: Kompres file SQL ───────────────────────────────
function Invoke-Compress {
    param($SqlFile)
    Write-HEAD "Step 2: Kompres File Backup"

    $zipFile = $SqlFile -replace "\.sql$", ".zip"
    try {
        Compress-Archive -Path $SqlFile -DestinationPath $zipFile -CompressionLevel Optimal -Force
        $origKB = [math]::Round((Get-Item $SqlFile).Length / 1KB, 1)
        $zipKB  = [math]::Round((Get-Item $zipFile).Length / 1KB, 1)
        $ratio  = [math]::Round((1 - $zipKB/$origKB) * 100, 0)

        # Hapus file .sql asli setelah dikompres
        Remove-Item $SqlFile -Force
        Write-Log "Kompres berhasil: $origKB KB → $zipKB KB (hemat $ratio%)" "OK"
        return $zipFile
    } catch {
        Write-Log "Gagal kompres, tetap pakai .sql: $_" "INFO"
        return $SqlFile   # fallback ke file asli
    }
}

# ── Step 3: Upload ke Google Drive ─────────────────────────
function Invoke-RcloneUpload {
    param($LocalFile)
    Write-HEAD "Step 3: Upload ke Google Drive"

    $rclone = Find-Rclone
    if (-not $rclone) {
        Write-Log "rclone tidak ditemukan! Lihat dokumentasi setup-rclone-gdrive.md" "ERROR"
        return $false
    }
    Write-Log "Menggunakan rclone: $rclone"

    $fileName    = Split-Path $LocalFile -Leaf
    $destination = "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}"

    Write-Log "Upload: $fileName → GDrive/$GDRIVE_FOLDER/"

    try {
        $proc = Start-Process -FilePath $rclone `
                              -ArgumentList @(
                                  "copy",
                                  "`"$LocalFile`"",
                                  "`"$destination`"",
                                  "--progress",
                                  "--stats=5s",
                                  "--log-level=INFO",
                                  "--log-file=`"$LOG_FILE`""
                              ) `
                              -Wait -PassThru -NoNewWindow

        if ($proc.ExitCode -ne 0) {
            Write-Log "Upload gagal (exit $($proc.ExitCode))" "ERROR"
            return $false
        }

        Write-Log "Upload berhasil: $fileName → GDrive/$GDRIVE_FOLDER/" "OK"
        return $true

    } catch {
        Write-Log "Exception saat upload: $_" "ERROR"
        return $false
    }
}

# ── Step 4: Hapus backup lokal lama ───────────────────────
function Remove-OldLocalBackups {
    Write-HEAD "Step 4: Bersihkan Backup Lokal (>$KEEP_LOCAL_DAYS hari)"

    $cutoff = (Get-Date).AddDays(-$KEEP_LOCAL_DAYS)
    $files  = Get-ChildItem -Path $BACKUP_DIR -Filter "sdms_*" -File -ErrorAction SilentlyContinue |
              Where-Object { $_.LastWriteTime -lt $cutoff }

    if ($files.Count -eq 0) {
        Write-Log "Tidak ada backup lokal lama yang perlu dihapus" "OK"
        return
    }

    foreach ($f in $files) {
        Remove-Item $f.FullName -Force
        Write-Log "Dihapus (lokal): $($f.Name)"
    }
    Write-Log "Hapus $($files.Count) backup lokal lama selesai" "OK"
}

# ── Step 5: Hapus backup lama di Google Drive ──────────────
function Remove-OldCloudBackups {
    Write-HEAD "Step 5: Bersihkan Backup di GDrive (>$KEEP_CLOUD_DAYS hari)"

    $rclone = Find-Rclone
    if (-not $rclone) { return }

    $destination = "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}"
    $cutoffDate  = (Get-Date).AddDays(-$KEEP_CLOUD_DAYS).ToString("yyyy-MM-dd")

    Write-Log "Hapus file GDrive lebih lama dari $cutoffDate..."

    try {
        # rclone delete dengan filter tanggal
        $proc = Start-Process -FilePath $rclone `
                              -ArgumentList @(
                                  "delete",
                                  "`"$destination`"",
                                  "--min-age", "${KEEP_CLOUD_DAYS}d",
                                  "--log-level=INFO"
                              ) `
                              -Wait -PassThru -NoNewWindow

        if ($proc.ExitCode -eq 0) {
            Write-Log "Bersihkan GDrive selesai" "OK"
        } else {
            Write-Log "Gagal bersihkan GDrive (exit $($proc.ExitCode))" "ERROR"
        }
    } catch {
        Write-Log "Exception saat hapus cloud: $_" "ERROR"
    }
}

# ── MAIN ───────────────────────────────────────────────────
function Main {
    Ensure-Directory "$PSScriptRoot\logs"
    Ensure-Directory $BACKUP_DIR

    $startTime = Get-Date
    Write-Log "====== SDMS Backup + GDrive Upload dimulai ======"

    # Step 1 — Backup DB
    $sqlFile = Invoke-DatabaseBackup
    if (-not $sqlFile) {
        Write-Log "BACKUP GAGAL — Proses dihentikan." "ERROR"
        exit 1
    }

    # Step 2 — Kompres
    $uploadFile = Invoke-Compress -SqlFile $sqlFile

    # Step 3 — Upload
    $uploaded = Invoke-RcloneUpload -LocalFile $uploadFile
    if (-not $uploaded) {
        Write-Log "UPLOAD GAGAL — File lokal tetap tersimpan di: $uploadFile" "ERROR"
        # Tidak exit, file lokal tetap ada sebagai fallback
    }

    # Step 4 — Bersihkan lokal lama
    Remove-OldLocalBackups

    # Step 5 — Bersihkan cloud lama
    if ($uploaded) {
        Remove-OldCloudBackups
    }

    $duration = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)
    Write-Log "====== Selesai dalam $duration detik ======" "OK"
    Write-Host ""
}

# Jalankan
Main
