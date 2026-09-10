@echo off
title AuraMed AI - Frontend Dashboard (Vite + React)
cd /d "%~dp0frontend setup\final frontend"
set TEMP=%~dp0..\.tmp
set TMP=%~dp0..\.tmp
set npm_config_cache=%~dp0..\.cache\npm
echo ===================================================
echo   Starting AuraMed AI Frontend Dashboard
echo   Local UI: http://localhost:5173
echo ===================================================
npm run dev
pause
