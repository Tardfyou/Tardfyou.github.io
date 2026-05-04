param(
  [int]$Port = 1313,
  [switch]$Drafts
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$wingetLinks = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links"
$localHugo = Join-Path $repoRoot ".tools\hugo"
$env:Path = "$localHugo;$wingetLinks;C:\Program Files\nodejs;$env:Path"

$hugo = Get-Command hugo -ErrorAction SilentlyContinue
if (-not $hugo) {
  throw "Hugo was not found. Install Hugo Extended first: winget install --id Hugo.Hugo.Extended --exact --source winget"
}

$args = @(
  "server",
  "--bind", "127.0.0.1",
  "--baseURL", "http://localhost:$Port/",
  "--port", "$Port",
  "--disableFastRender"
)

if ($Drafts) {
  $args += "--buildDrafts"
}

Write-Host "Starting Hugo preview at http://localhost:$Port/"
& $hugo.Source @args
