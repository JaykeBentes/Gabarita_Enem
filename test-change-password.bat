@echo off
echo ===================================
echo TESTE DE MODIFICAR SENHA
echo ===================================
echo.

echo 1. Testando conexao com banco de dados...
cd backend
node test-change-password.js
echo.

echo 2. Para testar a API, execute:
echo    - Inicie o backend: npm run dev
echo    - Abra o arquivo: test-change-password-simple.html
echo    - Ou execute: node test-api-change-password.js
echo.

echo 3. Email de teste disponivel: jakebentes@hotmail.com
echo.

pause