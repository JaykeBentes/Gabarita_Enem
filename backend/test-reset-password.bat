@echo off
echo Executando diagnóstico de recuperação de senha...
cd /d "%~dp0"
node scripts/test-config.js
pause