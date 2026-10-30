import os, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
KEY = os.path.expanduser('~/.ssh/trader_vps')
b = paramiko.SSHClient(); b.set_missing_host_key_policy(paramiko.AutoAddPolicy())
b.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=25, look_for_keys=False, allow_agent=False)
def run(cmd, t=180):
    _, so, se = b.exec_command(cmd, timeout=t)
    return (so.read().decode('utf-8','replace') + so.channel.recv_exit_status().__str__() and (so.read().decode('utf-8','replace') + se.read().decode('utf-8','replace')))
def run2(cmd, t=180):
    _, so, se = b.exec_command(cmd, timeout=t)
    out = so.read().decode('utf-8','replace'); err = se.read().decode('utf-8','replace')
    return out + err
print(run2('grep -q MCP_ENABLED /etc/umami.env || echo MCP_ENABLED=1 >> /etc/umami.env; grep MCP /etc/umami.env; systemctl restart umami; sleep 6; systemctl is-active umami'))
print(run2('curl -s -o /tmp/mcpout -w mcp:%{http_code} -X POST -H "content-type: application/json" -H "accept: application/json, text/event-stream" -d @/tmp/mcp-probe.json http://127.0.0.1:3001/mcp; echo; head -c 200 /tmp/mcpout'))
print('--- trader check:')
print(run2('for s in trader-vnext-predict trader-market trader-micro trader-watchdog trader-brain m23-opportunity-shadow; do printf "%s=%s " "$s" "$(systemctl is-active $s)"; done; echo'))
b.close()