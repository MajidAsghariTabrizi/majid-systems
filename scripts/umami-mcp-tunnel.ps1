param()
# Umami MCP tunnel — auto-reconnecting SSH forward to the analytics host.
$log = "$env:USERPROFILE\.dsh\var\umami-mcp-tunnel.log"
while ($true) {
  $ts = Get-Date -Format o
  try {
    & ssh -i "$env:USERPROFILE\.ssh\trader_vps" -N -o ServerAliveInterval=30 -o ServerAliveCountMax=4 -o ExitOnForwardFailure=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 -L 127.0.0.1:3011:127.0.0.1:3001 root@87.107.152.67 2>&1 | ForEach-Object { "$ts $_" | Add-Content $log }
    "$ts tunnel exited, restarting in 10s" | Add-Content $log
  } catch { "$ts error: $_" | Add-Content $log }
  Start-Sleep -Seconds 10
}