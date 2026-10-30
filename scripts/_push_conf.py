import io, paramiko, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
s = c.open_sftp()
s.put('nginx/quantiviq.conf', '/etc/nginx/sites-available/quantiviq')
_, so, se = c.exec_command('nginx -t 2>&1; systemctl reload nginx && sleep 1; curl -sk -o /dev/null -w script:%{http_code} https://127.0.0.1/_q/script.js -H "Host: quantiviq.xyz"; echo; curl -sk -o /dev/null -w site:%{http_code} https://127.0.0.1/en -H "Host: quantiviq.xyz"', timeout=120)
print(so.read().decode('utf-8', 'replace'))
c.close()