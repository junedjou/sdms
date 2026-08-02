@echo off
title SDMS Frontend
echo ============================================
echo  SDMS Frontend - Vue.js Development Server
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
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Memulai frontend di http://localhost:5173
echo.

cd /d "%~dp0frontend"
npm run dev
pause
