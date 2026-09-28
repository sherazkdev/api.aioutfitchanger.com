param(
  [Parameter(Mandatory = $true)][string]$CdpJsonPath,
  [Parameter(Mandatory = $true)][string]$OutPath
)
$j = Get-Content -Raw $CdpJsonPath | ConvertFrom-Json
if (-not $j.data) { throw "No data in $CdpJsonPath" }
$dir = Split-Path $OutPath -Parent
if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
[IO.File]::WriteAllBytes($OutPath, [Convert]::FromBase64String($j.data))
Write-Output "Saved $OutPath ($((Get-Item $OutPath).Length) bytes)"
