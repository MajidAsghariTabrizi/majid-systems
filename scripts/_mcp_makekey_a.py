import io, re, json, shlex, paramiko, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
sftp = a.open_sftp()
with sftp.open('/root/.umami-admin-cred') as f: adminpw = f.read().decode().strip()
def run(cmd, label=''):
    _, so, se = a.exec_command(cmd, timeout=120)
    out = so.read().decode('utf-8','replace')
    print('>> ' + label + ' [' + out.strip()[:300] + ']', flush=True)
    return out.strip()
body = json.dumps({'username': 'admin', 'password': adminpw})
tok = (re.search(r'"token":"([^"]+)"', run('curl -s -H "content-type: application/json" -d ' + shlex.quote(body) + ' http://127.0.0.1:3010/api/auth/login', 'login')) or [None, ''])[1]
H = '"Authorization: Bearer ' + tok + '"'
key_json = run('curl -s -H ' + H + ' -H "content-type: application/json" -X POST -d ' + shlex.quote(json.dumps({'name': 'agent-mcp-readonly'})) + ' http://127.0.0.1:3010/api/me/api-keys', 'create-key')
m = re.search(r'"key":"(umami_[A-Za-z0-9]+)"', key_json)
apikey = m.group(1) if m else ''
print('APIKEY_CREATED=' + str(bool(apikey)), flush=True)
PROBE2 = '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\",\"params\":{\"protocolVersion\":\"2026-07-28\",\"capabilities\":{},\"clientInfo\":{\"name\":\"agent\",\"version\":\"1\"}}}'
with sftp.open('/tmp/mcp-probe2.json', 'w') as f: f.write(PROBE2)
run('curl -s -o /tmp/mcp2 -w mcp:%{http_code} -X POST -H "content-type: application/json" -H "accept: application/json, text/event-stream" -H "Authorization: Bearer ' + apikey + '" -d @/tmp/mcp-probe2.json http://127.0.0.1:3010/mcp; echo; head -c 300 /tmp/mcp2', 'mcp-with-key')
with sftp.open('/root/.umami-mcp-key', 'w') as f: f.write(apikey)
run('chmod 600 /root/.umami-mcp-key', 'key-perm')
print('STORED_KEY_ON_A=yes', flush=True)
a.close()