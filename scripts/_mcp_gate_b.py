import os, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
KEY = os.path.expanduser('~/.ssh/trader_vps')
b = paramiko.SSHClient(); b.set_missing_host_key_policy(paramiko.AutoAddPolicy())
b.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=25, look_for_keys=False, allow_agent=False)
def run(cmd, t=120):
    _, so, se = b.exec_command(cmd, timeout=t)
    return (so.read().decode('utf-8','replace') + se.read().decode('utf-8','replace'))
print(run('grep -rn "MCP_ENABLED" /opt/umami/src /opt/umami/next.config.ts 2>/dev/null | head -6'))
print('--- route tail:');
print(run('sed -n "50,90p" /opt/umami/src/app/mcp/route.ts'))
print('--- build manifest has mcp?')
print(run('grep -o "/mcp" /opt/umami/.next/standalone/.next/server/app/mcp* 2>/dev/null | head -2; ls /opt/umami/.next/standalone/.next/server/app/ | grep -i mcp; grep -o "mcp[^,]*" /opt/umami/.next/standalone/.next/app-path-routes-manifest.json 2>/dev/null | head -3'))
b.close()