@echo off
echo ====================================
echo    Iniciando AppEnem - Todos os Servicos
echo ====================================
echo.

echo [1/3] Iniciando ENEM-API (porta 3001)...
start "ENEM-API" cmd /k "cd /d d:\Curso_ADS_uninorte\4Periodo\AppEnem\enem-api && npm run dev"

echo Aguardando 5 segundos para ENEM-API inicializar...
timeout /t 5 /nobreak > nul

echo [2/3] Iniciando Backend (porta 3000)...
start "Backend" cmd /k "cd /d d:\Curso_ADS_uninorte\4Periodo\AppEnem\backend && npm run dev"

echo Aguardando 5 segundos para Backend inicializar...
timeout /t 5 /nobreak > nul

echo [3/3] Iniciando Frontend (porta 5173)...
start "Frontend" cmd /k "cd /d d:\Curso_ADS_uninorte\4Periodo\AppEnem\frontend && npm run dev"

echo.
echo ====================================
echo    Todos os servicos foram iniciados!
echo ====================================
echo.
echo URLs de acesso:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:3000  
echo - ENEM API: http://localhost:3001
echo.
echo Pressione qualquer tecla para fechar...
pause > nul