@echo off
title SDMS Seed Data
echo ============================================
echo  SDMS - Mengisi Data Awal (Roles & Admin)
echo ============================================
echo.

if exist "C:\laragon\bin\nodejs\node-v22\node.exe" (
    set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%
)

echo [INFO] Pastikan XAMPP MySQL sudah aktif dan backend sudah dijalankan minimal sekali!
echo.
echo Proses akan membuat:
echo  - 6 roles (super_admin, admin, guru, pegawai, siswa, operator)
echo  - 40 permissions
echo  - 1 user super admin (username: superadmin, password: Admin@SDMS2024!)
echo.
pause

cd /d "%~dp0backend"
node seeds/run.js

echo.
echo ============================================
echo  Selesai! Sekarang bisa login di:
echo  http://localhost:5173
echo  Username : superadmin
echo  Password : Admin@SDMS2024!
echo ============================================
pause
