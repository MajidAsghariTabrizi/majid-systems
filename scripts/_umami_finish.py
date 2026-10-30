#!/usr/bin/env python3
import io, sys, secrets, re, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
def run(cmd, timeout=120, check=False, label=''):
    print('A>> ' + label, flush=True)
    _, so, se = a.exec_command(cmd, timeout=timeout)
    out = so.read().decode('utf-8','replace'); err = se.read().decode('utf-8','replace')
    code = so.channel.recv_exit_status()
    print(((out.strip()[:600]) + ((' E ' + err.strip()[:200]) if err.strip() else '')), flush=True)
    return out.strip()
hb = run('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3010/api/heartbeat', label='hb')
login = run('curl -s -c /tmp/j -H "content-type: application/json" -d \'{"username":"admin","password":"umami"}\' -o /dev/null -w "%{http_code}" http://127.0.0.1:3010/api/auth/login', label='default-login')
if login != '200':
    run('systemctl restart umami-tunnel', label='tunnel-restart')
    import time; time.sleep(5)
    login = run('curl -s -c /tmp/j -H "content-type: application/json" -d \'{"username":"admin","password":"umami"}\' -o /dev/null -w "%{http_code}" http://127.0.0.1:3010/api/auth/login', label='login-retry')
body = run('curl -s -c /tmp/j -H "content-type: application/json" -d \'{"username":"admin","password":"umami"}\' http://127.0.0.1:3010/api/auth/login', label='login-body')
tok = re.search(r'"token":"([^"]+)"', body or '')
TOKEN = 'Authorization: Bearer ' + (tok.group(1) if tok else 'NONE')
adminpw = secrets.token_urlsafe(18)
run('printf \'%s\' \'' + adminpw + '\' > /root/.umami-admin-cred && chmod 600 /root/.umami-admin-cred', label='cred')
me = run('curl -s -H "' + TOKEN + '" http://127.0.0.1:3010/api/me', label='me')
import json, re
m = re.search(r'"id":"([^"]+)"', me or '')
uid = m.group(1) if m else ''
print('UID=' + uid, flush=True)
if uid:
    run('curl -s -H "' + TOKEN + '" -H "content-type: application/json" -X POST -d \'{"id":"' + uid + '","username":"admin","password":"' + adminpw + '"}\' -o /dev/null -w "%{http_code}" http://127.0.0.1:3010/api/users/' + uid, label='set-password')
site = run('curl -s -H "' + TOKEN + '" -H "content-type: application/json" -X POST -d \'{"name":"Quantiviq","domain":"quantiviq.xyz"}\' http://127.0.0.1:3010/api/websites', label='create-website')
wid = re.search(r'"id":"([^"]+)"', site or '')
print('WEBSITE_ID=' + (wid.group(1) if wid else 'PARSE_FAIL:' + (site or '')[:150]), flush=True)
a.close()