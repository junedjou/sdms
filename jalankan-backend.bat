@echo off
title SDMS Backend
echo ============================================
echo  SDMS Backend - School Data Management System
echo ============================================
echo.

:: Deteksi Node.js dari Laragon atau PATH biasa
if exist "C:\laragon\bin\nodejs\node-v22\node.exe" (
    set PATH=C:\laragon\bin\nodejs\node-v22;%PATH%
    echo [OK] Node.js ditemukan di Laragon
) else (
    where node >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Node.js tidak ditemukan!
        echo Pastikan Node.js sudah terinstall via Laragon atau nodejs.org
        pause
        exit /b 1
    ) else (
        echo [OK] Node.js ditemukan di PATH
    )
)

echo.
echo [INFO] Pastikan XAMPP MySQL sudah aktif!
echo [INFO] Memulai backend di http://localhost:3000
echo.

cd /d "%~dp0backend"
npm run dev
pause
