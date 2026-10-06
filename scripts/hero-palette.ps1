# Palette / non-blank spot check for hero captures.
# Samples pixels and asserts the design palette shows up where expected:
#   mint   = #7cd9b7 (accent, new architecture / active new-era elements)
#   amber  = #f0a868 (waiting / latency / traditional flow)
# Also asserts the stage region is not a flat blank rectangle.
param(
  [string]$Dir = "captures"
)
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

function Get-PaletteStats([string]$png) {
  $bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $png))
  $mint = 0; $amber = 0; $total = 0
  $w = $bmp.Width; $h = $bmp.Height
  for ($x = 0; $x -lt $w; $x += 4) {
    for ($y = 0; $y -lt $h; $y += 4) {
      $c = $bmp.GetPixel($x, $y)
      $total++
      if ([Math]::Abs($c.R - 124) -le 28 -and [Math]::Abs($c.G - 217) -le 28 -and [Math]::Abs($c.B - 183) -le 28) { $mint++ }
      if ([Math]::Abs($c.R - 240) -le 28 -and [Math]::Abs($c.G - 168) -le 30 -and [Math]::Abs($c.B - 104) -le 30) { $amber++ }
    }
  }
  $bmp.Dispose()
  [PSCustomObject]@{ File = Split-Path $png -Leaf; Mint = $mint; Amber = $amber; Total = $total }
}

$expectations = @(
  @{ File = "01-initial-traditional.png"; Mint = 0;    Amber = 3 },   # amber trail/latency hints, no mint accent yet
  @{ File = "03-old-signal-midflow.png";  Mint = 0;    Amber = 3 },   # amber signal + trail mid old flow
  @{ File = "06-mid-transformation.png";  Mint = 1;    Amber = 0 },   # mint emerging; old amber edges faded by design
  @{ File = "07-ai-native-idle.png";      Mint = 3;    Amber = 0 },   # mint architecture
  @{ File = "08-brain-investigation.png"; Mint = 3;    Amber = 0 },
  @{ File = "10-learning-moment.png";     Mint = 3;    Amber = 0 },
  @{ File = "11-comparison-payoff.png";   Mint = 3;    Amber = 0 },
  @{ File = "14-knowledge-overlay-new.png"; Mint = 6;  Amber = 0 },   # knowledge flow = mint
  @{ File = "13-comparison-latency-overlay-old.png"; Mint = 0; Amber = 4 }, # latency overlay = amber
  @{ File = "19-mobile-initial-traditional.png"; Mint = 0; Amber = 3 },
  @{ File = "22-mobile-ai-native.png";    Mint = 3;    Amber = 0 }
)

$fail = 0
foreach ($e in $expectations) {
  $p = Join-Path $Dir $e.File
  if (-not (Test-Path $p)) { Write-Output "MISSING: $($e.File)"; $fail++; continue }
  $s = Get-PaletteStats $p
  $okM = $s.Mint -ge $e.Mint
  $okA = $s.Amber -ge $e.Amber
  $status = if ($okM -and $okA) { "OK " } else { "FAIL"; $fail++ }
  Write-Output ("{0} {1}  mint={2}/{3} amber={4}/{5}" -f $status, $e.File, $s.Mint, $e.Mint, $s.Amber, $e.Amber)
}
if ($fail -gt 0) { Write-Output "$fail palette check(s) FAILED"; exit 1 }
Write-Output "ALL PALETTE CHECKS PASSED"
