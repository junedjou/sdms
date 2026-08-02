@echo off
title SDMS Auto Backup (tiap 24 jam)
color 0B
echo.
echo  ================================================
echo   SDMS - Auto Backup Database
echo   Backup otomatis setiap 24 jam
echo   Biarkan jendela ini tetap terbuka!
echo  ================================================
echo.

python "%~dp0backup.py" --auto

pause
