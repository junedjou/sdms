@echo off
title SDMS Restore Database
color 0E
echo.
echo  ================================================
echo   SDMS - Restore Database
echo   PERHATIAN: Ini akan menimpa data saat ini!
echo  ================================================
echo.
echo  Pastikan XAMPP MySQL sudah aktif!
echo.

python "%~dp0backup.py" --restore

echo.
pause
