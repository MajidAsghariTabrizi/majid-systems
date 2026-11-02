import io, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
_, so, se = a.exec_command('grep -E "02/Nov/2026:07:1[5-9]" /var/log/nginx/access.log | grep -E "/_q/|GET /en" | tail -8', timeout=120)
print(so.read().decode('utf-8','replace'))
a.close()