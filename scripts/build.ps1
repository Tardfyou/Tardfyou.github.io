param(
  [switch]$Drafts,
  [switch]$SkipPagefind
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$wingetLinks = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links"
$env:Path = "$wingetLinks;C:\Program Files\nodejs;$env:Path"

$hugo = Get-Command hugo -ErrorAction SilentlyContinue
if (-not $hugo) {
  throw "Hugo was not found. Install Hugo Extended first: winget install --id Hugo.Hugo.Extended --exact --source winget"
}

$hugoArgs = @("--minify", "--cleanDestinationDir")
if ($Drafts) {
  $hugoArgs += "--buildDrafts"
}

Write-Host "Running Hugo production build..."
& $hugo.Source @hugoArgs

if ($SkipPagefind) {
  Write-Host "Skipping Pagefind index."
  exit 0
}

$npx = Get-Command npx.cmd -ErrorAction SilentlyContinue
if (-not $npx) {
  $npx = Get-Command npx -ErrorAction SilentlyContinue
}
if (-not $npx) {
  throw "Node.js/npm was not found. Install Node.js LTS first: winget install --id OpenJS.NodeJS.LTS --exact --source winget"
}

Write-Host "Building Pagefind index..."
& $npx.Source -y pagefind@1.5.2 --site public --output-subdir _pagefind
