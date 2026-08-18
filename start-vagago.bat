@echo off
title VagaGo SaaS - Servidor Local
cls
echo ====================================================================
echo                   VAGAGO SAAS PLATFORM
echo          "Sua vaga parada pode gerar dinheiro."
echo ====================================================================
echo.
echo [1/2] Verificando dependencias...
cd /d "%~dp0"

echo [2/2] Iniciando servidor web do VagaGo na porta 3000...
echo.
echo ====================================================================
echo  Servidor pronto! Acesse no navegador:
echo  - Local:   http://localhost:3000/
echo ====================================================================
echo.

npm run dev -- --host 0.0.0.0 --port 3000
pause

