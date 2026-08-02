@echo off
title SDMS - School Data Management System
color 0A
echo.
echo  ================================================
echo   SDMS - School Data Management System
echo   One Login . One Data . One Dashboard
echo  ================================================
echo.
echo  PASTIKAN: XAMPP MySQL sudah aktif sebelum lanjut!
echo.
echo  Pilihan:
echo  [1] Jalankan SDMS (backend + frontend)
echo  [2] Jalankan + isi data contoh (pertama kali)
echo  [3] Hanya backend
echo  [4] Hanya frontend  
echo  [5] Keluar
echo.
set /p pilihan=Pilih (1-5): 

if "%pilihan%"=="1" goto jalankan
if "%pilihan%"=="2" goto dengan_sample
if "%pilihan%"=="3" goto backend_only
if "%pilihan%"=="4" goto frontend_only
if "%pilihan%"=="5" exit

:jalankan
echo.
echo  Memulai SDMS...
python "%~dp0start.py"
goto selesai

:dengan_sample
echo.
echo  Memulai SDMS dengan data contoh...
python "%~dp0start.py" --sample
goto selesai

:backend_only
echo.
echo  Memulai backend saja...
python "%~dp0start.py" --backend
goto selesai

:frontend_only
echo.
echo  Memulai frontend saja...
python "%~dp0start.py" --frontend
goto selesai

:selesai
pause
