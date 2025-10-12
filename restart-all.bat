@echo off
echo ====================================
echo    Reiniciando Todos os Servicos
echo ====================================

echo Parando processos existentes...
taskkill /f /im node.exe 2>nul

echo Aguardando 3 segundos...
timeout /t 3 /nobreak > nul

echo [1/3] Iniciando ENEM-API (porta 3001)...
start "ENEM-API" cmd /k "cd /d d:\Curso_ADS_uninorte\4Periodo\AppEnem\enem-api && npm run dev"

echo Aguardando 5 segundos...
timeout /t 5 /nobreak > nul

echo [2/3] Iniciando Backend (porta 3000)...
start "Backend" cmd /k "cd /d d:\Curso_ADS_uninorte\4Periodo\AppEnem\backend && npm run dev"

echo Aguardando 5 segundos...
timeout /t 5 /nobreak > nul

echo [3/3] Iniciando Frontend (porta 5173)...
start "Frontend" cmd /k "cd /d d:\Curso_ADS_uninorte\4Periodo\AppEnem\frontend && npm run dev"

echo.
echo ====================================
echo    Todos os servicos foram reiniciados!
echo ====================================
echo.
echo URLs de acesso:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:3000  
echo - ENEM API: http://localhost:3001
echo.
pause