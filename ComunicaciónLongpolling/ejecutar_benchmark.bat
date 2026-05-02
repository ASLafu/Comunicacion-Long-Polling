@echo off
title HAL 9000 — Benchmark 10.000 transmisiones
echo ============================================================
echo   HAL 9000 — BENCHMARK 10.000 TRANSMISIONES
echo   Discovery One Communication System
echo ============================================================
echo.

cd /d "%~dp0"

:: Comprobar si el servidor ya está en el puerto 4001
netstat -ano | findstr ":4001 " >nul 2>&1
if %errorlevel% neq 0 (
	echo   [HAL] Servidor no detectado. Iniciando servidor.js en puerto 4001...
	start "HAL 9000 - Servidor" /min node servidor.js
	timeout /t 2 /nobreak >nul
	echo   [HAL] Servidor iniciado.
) else (
	echo   [HAL] Servidor ya operativo en puerto 4001.
)

echo.
echo   Abriendo interfaz en el navegador: http://localhost:4001
echo.
start "" "http://localhost:4001"

echo   Ejecutando benchmark por consola tambien...
echo.
node benchmark.js

pause
