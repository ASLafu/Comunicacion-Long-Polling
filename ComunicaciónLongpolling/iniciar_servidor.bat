@echo off
title Servidor Long Polling – CIS 2026
echo ============================================================
echo   Servidor Long Polling – CIS 2026
echo   Puerto: 4001
echo ============================================================
echo.
echo   Deja esta ventana abierta y ejecuta el benchmark.
echo   Para detener pulsa Ctrl+C
echo ============================================================
echo.

cd /d "%~dp0"
node servidor.js

pause
