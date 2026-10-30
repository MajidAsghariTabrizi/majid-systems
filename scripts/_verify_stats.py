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
    print('>> ' + label + ' [' + out.strip()[:400] + ']', flush=True)
    return out.strip()
body = json.dumps({'username': 'admin', 'password': adminpw})
tok = (re.search(r'"token":"([^"]+)"', run('curl -s -H "content-type: application/json" -d ' + shlex.quote(body) + ' http://127.0.0.1:3010/api/auth/login', 'login')) or [None,''])[1]
H = '"Authorization: Bearer ' + tok + '"'
run('curl -s -H ' + H + ' "http://127.0.0.1:3010/api/websites/24264632-11ad-4bcf-a899-82ebbe58f77a/stats?startAt=1793300000000&endAt=1793500000000"', 'stats')
run('curl -s -H ' + H + ' "http://127.0.0.1:3010/api/websites/24264632-11ad-4bcf-a899-82ebbe58f77a/metrics?type=event&startAt=1793300000000&endAt=1793500000000"', 'events')
a.close()