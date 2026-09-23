@echo off
title Test Backup GDrive - SDMS
color 0B
echo.
echo  ================================================
echo   SDMS - Test Backup + Upload ke Google Drive
echo   Jalankan ini untuk uji coba sebelum otomatis
echo  ================================================
echo.
echo  Pastikan:
echo    1. XAMPP / MySQL sudah aktif
echo    2. rclone sudah terkonfigurasi (lihat setup-rclone-gdrive.md)
echo.

powershell.exe -ExecutionPolicy Bypass -File "%~dp0backup-gdrive.ps1"

echo.
echo  ================================================
echo   Cek log di: backup\logs\backup-gdrive.log
echo  ================================================
echo.
pause
