# Pixel verification: for a figure crop PNG, measures (a) ink bounding box
# vs image edges (content touching an edge = clipped), (b) ink coverage.
# Compares production "before" crops with fixed-build "after" crops.
param(
  [string]$BeforeDir = "captures-figqa/before",
  [string]$AfterDir = "captures-figqa/prod-after"
)
Add-Type -AssemblyName System.Drawing

function Get-InkStats([string]$path) {
  if (-not (Test-Path $path)) { return $null }
  $bmp = [System.Drawing.Bitmap]::FromFile($path)
  $w = $bmp.Width; $h = $bmp.Height
  $minX = $w; $minY = $h; $maxX = -1; $maxY = -1; $ink = 0; $total = $w * $h
  # sample every 2nd pixel for speed; ink = pixel far from the card background (#0d1420)
  for ($y = 0; $y -lt $h; $y += 2) {
    for ($x = 0; $x -lt $w; $x += 2) {
      $p = $bmp.GetPixel($x, $y)
      $d = [Math]::Abs($p.R - 13) + [Math]::Abs($p.G - 20) + [Math]::Abs($p.B - 32)
      if ($d -gt 60) {
        $ink++
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  $bmp.Dispose()
  if ($maxX -lt 0) { return @{ empty = $true } }
  return @{
    w = $w; h = $h
    inkPct = [Math]::Round(100 * $ink / ($total / 4), 1)
    leftGap = $minX; topGap = $minY; rightGap = ($w - 1 - $maxX); bottomGap = ($h - 1 - $maxY)
    edgeTouch = (($minX -le 1) -or ($minY -le 1) -or (($w - 1 - $maxX) -le 1) -or (($h - 1 - $maxY) -le 1))
  }
}

$pairs = @(
  @{ name = "EN07 legend"; before = "$BeforeDir/prod-fig07-legend-overflow.png"; after = "$AfterDir/crop-fig07.png" },
  @{ name = "EN09 circle"; before = "$BeforeDir/prod-fig09-circle-clipped.png"; after = "$AfterDir/crop-fig09.png" },
  @{ name = "FA01 anchors"; before = "$BeforeDir/prod-fig01-anchor-flip.png"; after = "$AfterDir/crop-fig01.png" },
  @{ name = "FA04 anchors"; before = "$BeforeDir/prod-fig04-anchor-flip.png"; after = "$AfterDir/crop-fig04.png" },
  @{ name = "FA06 anchors"; before = "$BeforeDir/prod-fig06-anchor-flip.png"; after = "$AfterDir/crop-fig06.png" }
)

foreach ($p in $pairs) {
  $b = Get-InkStats $p.before
  $a = Get-InkStats $p.after
  if ($null -eq $b -or $null -eq $a) { Write-Output ("{0}: MISSING FILE (before={1}, after={2})" -f $p.name, ($null -ne $b), ($null -ne $a)); continue }
  Write-Output ("{0}:" -f $p.name)
  Write-Output ("  BEFORE  {1}x{2} ink={3}%  gaps L{4} T{5} R{6} B{7}  edgeTouch={8}" -f "", $b.w, $b.h, $b.inkPct, $b.leftGap, $b.topGap, $b.rightGap, $b.bottomGap, $b.edgeTouch)
  Write-Output ("  AFTER   {1}x{2} ink={3}%  gaps L{4} T{5} R{6} B{7}  edgeTouch={8}" -f "", $a.w, $a.h, $a.inkPct, $a.leftGap, $a.topGap, $a.rightGap, $a.bottomGap, $a.edgeTouch)
}
