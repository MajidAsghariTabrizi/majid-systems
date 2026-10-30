#!/usr/bin/env python3
import io, os, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
PUB = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO6l/4n/LZIuNz+7hudR75rqr/KEHrvOUu/wUoTyNOWP umami-tunnel'
KEYB = os.path.expanduser('~/.ssh/trader_vps')
b = paramiko.SSHClient(); b.set_missing_host_key_policy(paramiko.AutoAddPolicy())
b.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEYB), timeout=25, look_for_keys=False, allow_agent=False)
def brun(cmd, timeout=120, check=True, label=''):
    print('B>> ' + (label or cmd[:80]), flush=True)
    _, so, se = b.exec_command(cmd, timeout=timeout)
    out = so.read().decode('utf-8','replace'); err = se.read().decode('utf-8','replace')
    code = so.channel.recv_exit_status()
    print((out.strip()[:400] or '') + ((' E '+err.strip()[:200]) if err.strip() else ''), flush=True)
    if check and code != 0: sys.exit(1)
    return out
# restricted key: only port-forward to umami, only from server A, no shell/pty/agent
brun('grep -q umami-tunnel /home/tunnel/.ssh/authorized_keys 2>/dev/null || printf \'from="171.22.24.45",restrict,port-forwarding,permitopen="127.0.0.1:3001" %s\\n\' \'' + PUB + '\' >> /home/tunnel/.ssh/authorized_keys', label='auth-key')
brun('chown tunnel:tunnel /home/tunnel/.ssh/authorized_keys && chmod 600 /home/tunnel/.ssh/authorized_keys && cat /home/tunnel/.ssh/authorized_keys | cut -c1-60', label='perm')
b.close()
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
def arun(cmd, timeout=120, check=True, label=''):
    print('A>> ' + (label or cmd[:80]), flush=True)
    _, so, se = a.exec_command(cmd, timeout=timeout)
    out = so.read().decode('utf-8','replace'); err = se.read().decode('utf-8','replace')
    code = so.channel.recv_exit_status()
    print((out.strip()[:700] or '') + ((' E '+err.strip()[:250]) if err.strip() else ''), flush=True)
    if check and code != 0: sys.exit(1)
    return out
arun('systemctl daemon-reload && systemctl enable --now umami-tunnel && sleep 4 && systemctl is-active umami-tunnel', label='tunnel-start')
arun('curl -s -o /dev/null -w "tunnel-heartbeat:%{http_code}\\n" http://127.0.0.1:3010/api/heartbeat', label='tunnel-hb')
# bootstrap umami: login default, set admin password, create website
arun('curl -s -c /tmp/umami.jar -H "content-type: application/json" -d \'{"username":"admin","password":"umami"}\' http://127.0.0.1:3010/api/auth/login -o /tmp/login.json -w "login:%{http_code}\\n"', label='umami-login')
NEWPW = brun('echo x', check=False)  # placeholder noop
# generate password on B, store root-only; pass back silently
import secrets
adminpw = secrets.token_urlsafe(18)
arun('printf \'%s\' \'' + adminpw + '\' > /root/.umami-admin-cred && chmod 600 /root/.umami-admin-cred', label='cred-file')
# find admin user id then update password
uid = arun('curl -s -b /tmp/umami.jar http://127.0.0.1:3010/api/users | head -c 200', label='users')
arun('curl -s -b /tmp/umami.jar -H "content-type: application/json" -X POST -d \'{"username":"admin","password":"' + adminpw + '"}\' http://127.0.0.1:3010/api/admin -w "\\npw:%{http_code}\\n" -o /dev/null', label='pw-1', check=False)
site = arun('curl -s -b /tmp/umami.jar -H "content-type: application/json" -X POST -d \'{"name":"Quantiviq","domain":"quantiviq.xyz"}\' http://127.0.0.1:3010/api/websites', label='website')
print('SITE_JSON=' + site.strip(), flush=True)
a.close(); b.close()
print('TUNNEL+BOOTSTRAP DONE', flush=True)