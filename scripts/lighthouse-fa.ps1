#!/usr/bin/env powershell -NoProfile
# Lighthouse FA suite, median-of-3 per page to neutralize host-load variance.
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
$env:CHROME_PATH = $edge
$pages = @(
  @{ name = 'fa-index'; url = 'http://127.0.0.1:3219/fa/insights' },
  @{ name = 'fa-01'; url = 'http://127.0.0.1:3219/fa/insights/ai-adoption-is-not-ai-transformation' },
  @{ name = 'fa-12'; url = 'http://127.0.0.1:3219/fa/insights/the-90-day-ai-transformation-roadmap' },
  @{ name = 'fa-20'; url = 'http://127.0.0.1:3219/fa/insights/inside-an-ai-native-transformation-mission' }
)
New-Item -ItemType Directory -Force -Path captures-lighthouse-fa | Out-Null
$allOk = $true
foreach ($p in $pages) {
  $scores = @()
  for ($r = 1; $r -le 3; $r++) {
    npx lighthouse $p.url --quiet --chrome-flags="--headless" --only-categories=performance,seo,accessibility --output=json --output-path="captures-lighthouse-fa\$($p.name)-r$r.json" 2>$null | Out-Null
    $j = Get-Content "captures-lighthouse-fa\$($p.name)-r$r.json" -Raw | ConvertFrom-Json
    $scores += [pscustomobject]@{
      perf = [math]::Round($j.categories.performance.score * 100)
      seo  = [math]::Round($j.categories.seo.score * 100)
      a11y = [math]::Round($j.categories.accessibility.score * 100)
    }
  }
  $med = $scores | Sort-Object perf | Select-Object -Index 1
  $runs = ($scores | ForEach-Object { $_.perf }) -join '/'
  $ok = ($med.perf -ge 90) -and ($med.seo -ge 90) -and ($med.a11y -ge 90)
  if (-not $ok) { $allOk = $false }
  Write-Output ("{0}: perf-median={1} (runs {2}) seo={3} a11y={4} -> {5}" -f $p.name, $med.perf, $runs, $med.seo, $med.a11y, $(if ($ok) { 'PASS' } else { 'FAIL' }))
}
if ($allOk) { Write-Output 'LIGHTHOUSE FA (median-of-3): ALL PASS (>=90 perf/seo/a11y)' } else { Write-Output 'LIGHTHOUSE FA: FAILURES PRESENT'; exit 1 }
