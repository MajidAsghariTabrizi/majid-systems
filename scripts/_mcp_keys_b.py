import os, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
KEY = os.path.expanduser('~/.ssh/trader_vps')
b = paramiko.SSHClient(); b.set_missing_host_key_policy(paramiko.AutoAddPolicy())
b.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=25, look_for_keys=False, allow_agent=False)
def run(cmd, t=120):
    _, so, se = b.exec_command(cmd, timeout=t)
    return (so.read().decode('utf-8','replace') + se.read().decode('utf-8','replace'))
print('== api-key lib ==')
print(run('cat /opt/umami/src/lib/api-key.ts | head -46'))
print('== apiKey schema ==')
print(run('grep -A 14 "model ApiKey" /opt/umami/prisma/schema.prisma'))
print('== create route ==')
print(run('sed -n "1,55p" /opt/umami/src/app/api/me/api-keys/route.ts'))
sftp = b.open_sftp()
probe = '{' + chr(34) + 'jsonrpc' + chr(34) + ':"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2026-07-28","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}'
with sftp.open('/tmp/mcp-probe.json', 'w') as f: f.write(probe)
print('== live mcp probe ==')
print(run('curl -s -o /tmp/mcpout -w mcp:%{http_code} -X POST -H "content-type: application/json" -H "accept: application/json, text/event-stream" -d @/tmp/mcp-probe.json http://127.0.0.1:3001/mcp; echo; head -c 260 /tmp/mcpout; echo; grep -o "^[A-Z_]*=" /etc/umami.env'))
b.close()