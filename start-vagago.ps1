# PowerShell Launcher Script for VagaGo SaaS
Set-Location -Path $PSScriptRoot

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "                  VAGAGO SAAS PLATFORM" -ForegroundColor Green
Write-Host "         'Sua vaga parada pode gerar dinheiro.'" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Iniciando o servidor de desenvolvimento do VagaGo..." -ForegroundColor White
Write-Host "Acesse no navegador: http://localhost:3000/" -ForegroundColor Green
Write-Host ""

npm run dev -- --host 0.0.0.0 --port 3000

