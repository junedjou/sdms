@echo off
title Daftarkan Auto Backup ke Windows Task Scheduler
color 0A
echo.
echo  ================================================
echo   Mendaftarkan backup otomatis ke Windows
echo   Backup akan berjalan otomatis tiap hari jam 02:00
echo  ================================================
echo.

REM Cari Python
python --version >nul 2>&1
if errorlevel 1 (
    echo Python tidak ditemukan!
    pause
    exit /b 1
)

REM Buat task scheduler backup tiap hari jam 02:00
schtasks /create /tn "SDMS-AutoBackup" ^
  /tr "python d:\WEBSITE\sdms\backup\backup.py" ^
  /sc daily ^
  /st 02:00 ^
  /ru SYSTEM ^
  /f

if errorlevel 0 (
    echo.
    echo  OK! Backup otomatis berhasil didaftarkan:
    echo     - Nama task : SDMS-AutoBackup
    echo     - Jadwal    : Setiap hari jam 02:00
    echo     - Script    : d:\WEBSITE\sdms\backup\backup.py
    echo.
    echo  Untuk lihat/hapus task:
    echo    Buka Task Scheduler ^(taskschd.msc^)
    echo    Cari "SDMS-AutoBackup"
) else (
    echo.
    echo  Gagal! Coba jalankan sebagai Administrator.
    echo  Klik kanan file ini -> Run as Administrator
)

echo.
pause
