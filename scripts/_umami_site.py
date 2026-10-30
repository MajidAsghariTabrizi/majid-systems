import io, sys, re, json, shlex, paramiko
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
data = json.dumps({'username': 'admin', 'password': adminpw})
q = shlex.quote(data)
body = run('curl -s -H "content-type: application/json" -d ' + q + ' http://127.0.0.1:3010/api/auth/login', 'relogin')
tok = (re.search(r'"token":"([^"]+)"', body) or [None, ''])[1]
site = run('curl -s -H "Authorization: Bearer ' + tok + '" -H "content-type: application/json" -X POST -d ' + shlex.quote(json.dumps({'name': 'Quantiviq', 'domain': 'quantiviq.xyz'})) + ' http://127.0.0.1:3010/api/websites', 'create-website')
m = re.search(r'"id":"([^"]+)"', site)
print('WEBSITE_ID=' + (m.group(1) if m else 'FAIL'), flush=True)
a.close()