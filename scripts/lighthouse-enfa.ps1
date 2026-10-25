#!/usr/bin/env powershell -NoProfile
# Fair EN-vs-FA Lighthouse comparison: interleaved median-of-3 on matched pages.
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
$env:CHROME_PATH = $edge
$pages = @(
  @{ name = 'en-index'; url = 'http://127.0.0.1:3219/en/insights' },
  @{ name = 'fa-index'; url = 'http://127.0.0.1:3219/fa/insights' },
  @{ name = 'en-12'; url = 'http://127.0.0.1:3219/en/insights/the-90-day-ai-transformation-roadmap' },
  @{ name = 'fa-12'; url = 'http://127.0.0.1:3219/fa/insights/the-90-day-ai-transformation-roadmap' },
  @{ name = 'en-20'; url = 'http://127.0.0.1:3219/en/insights/inside-an-ai-native-transformation-mission' },
  @{ name = 'fa-20'; url = 'http://127.0.0.1:3219/fa/insights/inside-an-ai-native-transformation-mission' }
)
New-Item -ItemType Directory -Force -Path captures-lighthouse-fa | Out-Null
foreach ($p in $pages) {
  $scores = @()
  for ($r = 1; $r -le 3; $r++) {
    npx lighthouse $p.url --quiet --chrome-flags="--headless" --only-categories=performance,seo,accessibility --output=json --output-path="captures-lighthouse-fa\$($p.name)-x$r.json" 2>$null | Out-Null
    $j = Get-Content "captures-lighthouse-fa\$($p.name)-x$r.json" -Raw | ConvertFrom-Json
    $scores += [pscustomobject]@{
      perf = [math]::Round($j.categories.performance.score * 100)
      seo  = [math]::Round($j.categories.seo.score * 100)
      a11y = [math]::Round($j.categories.accessibility.score * 100)
    }
  }
  $med = $scores | Sort-Object perf | Select-Object -Index 1
  $runs = ($scores | ForEach-Object { $_.perf }) -join '/'
  Write-Output ("{0}: perf-median={1} (runs {2}) seo={3} a11y={4}" -f $p.name, $med.perf, $runs, $med.seo, $med.a11y)
}
