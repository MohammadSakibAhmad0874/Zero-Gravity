@echo off
echo ========================================
echo CulturaMatch Setup Script
echo ========================================
echo.
echo [1/2] Installing backend dependencies...
cd /d "c:\Users\adi4sure_\OneDrive\Desktop\CulturaMatch\backend"
call npm install
echo Backend install complete.
echo.
echo [2/2] Installing frontend dependencies...
cd /d "c:\Users\adi4sure_\OneDrive\Desktop\CulturaMatch\frontend"
call npm install
echo Frontend install complete.
echo.
echo ========================================
echo SETUP COMPLETE
echo ========================================
