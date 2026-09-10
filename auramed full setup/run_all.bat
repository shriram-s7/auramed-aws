@echo off
title AuraMed AI System Launcher
echo ===================================================
echo   Starting AuraMed AI System (Backend + Frontend)
echo ===================================================
start "AuraMed Backend" "%~dp0run_backend.bat"
start "AuraMed Frontend" "%~dp0run_frontend.bat"
echo.
echo Both servers are launching in separate windows!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
timeout /t 5
