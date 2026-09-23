@echo off
title Daftarkan Backup GDrive ke Windows Task Scheduler
color 0A
echo.
echo  ================================================
echo   SDMS - Backup Otomatis ke Google Drive
echo   Jadwal: Tiap hari jam 01:00 dini hari
echo  ================================================
echo.
echo  Script ini harus dijalankan sebagai Administrator!
echo.

REM ── Cek apakah sudah Admin ──────────────────────────────
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo  [!!] Jalankan sebagai Administrator!
    echo       Klik kanan file ini -^> Run as Administrator
    echo.
    pause
    exit /b 1
)

REM ── Cek PowerShell tersedia ─────────────────────────────
powershell -Command "exit 0" >nul 2>&1
if errorlevel 1 (
    echo  [!!] PowerShell tidak ditemukan!
    pause
    exit /b 1
)

REM ── Variabel ────────────────────────────────────────────
set SCRIPT_PATH=d:\WEBSITE\sdms\backup\backup-gdrive.ps1
set TASK_NAME=SDMS-Backup-GDrive
set TASK_TIME=01:00

echo  [>>] Mendaftarkan task: %TASK_NAME%
echo  [>>] Script  : %SCRIPT_PATH%
echo  [>>] Jadwal  : Setiap hari jam %TASK_TIME%
echo.

REM ── Hapus task lama jika ada ────────────────────────────
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

REM ── Buat task baru ──────────────────────────────────────
schtasks /create ^
  /tn "%TASK_NAME%" ^
  /tr "powershell.exe -ExecutionPolicy Bypass -NonInteractive -WindowStyle Hidden -File \"%SCRIPT_PATH%\"" ^
  /sc daily ^
  /st %TASK_TIME% ^
  /ru SYSTEM ^
  /rl HIGHEST ^
  /f

if %errorLevel% EQU 0 (
    echo.
    echo  ================================================
    echo   [OK] Task berhasil didaftarkan!
    echo  ================================================
    echo.
    echo   Nama task : %TASK_NAME%
    echo   Jadwal    : Setiap hari jam %TASK_TIME%
    echo   Script    : %SCRIPT_PATH%
    echo.
    echo   Untuk cek/kelola task:
    echo     taskschd.msc  ^(buka Task Scheduler GUI^)
    echo     schtasks /query /tn "%TASK_NAME%"
    echo.
    echo   Untuk coba jalankan sekarang:
    echo     schtasks /run /tn "%TASK_NAME%"
    echo.
) else (
    echo.
    echo  [!!] Gagal mendaftarkan task!
    echo       Pastikan sudah Run as Administrator.
    echo.
)

echo  Tekan tombol apa saja untuk keluar...
pause >nul
