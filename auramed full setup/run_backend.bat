@echo off
title AuraMed AI - Backend Server (FastAPI)
cd /d "%~dp0backend setup"
set TEMP=%~dp0..\.tmp
set TMP=%~dp0..\.tmp
echo ===================================================
echo   Starting AuraMed AI Diagnostic Backend Server
echo   API Docs: http://127.0.0.1:8000/docs
echo ===================================================
"%~dp0backend setup\.venv\Scripts\python.exe" -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
pause
