param(
  [string]$Message = "Update blog"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

& (Join-Path $PSScriptRoot "build.ps1")

$changes = git status --porcelain
if (-not $changes) {
  Write-Host "No changes to publish."
  exit 0
}

git add --all
git commit -m $Message
git push origin HEAD

Write-Host "Pushed. GitHub Actions will build and deploy the site."
