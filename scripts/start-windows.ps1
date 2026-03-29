$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

docker compose up --build -d

Write-Host "App is starting at http://localhost:8000"
