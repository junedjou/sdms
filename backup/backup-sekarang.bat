@echo off
title SDMS Backup Database
color 0A
echo.
echo  ================================================
echo   SDMS - Backup Database
echo  ================================================
echo.
echo  Pastikan XAMPP MySQL sudah aktif!
echo.

python "%~dp0backup.py"

echo.
pause
