import io, sys, paramiko
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
_, so, _ = a.exec_command('curl -s -o /dev/null -w "direct-script:%{http_code} size:%{size_download}" http://127.0.0.1:3010/script.js; echo; curl -sk -o /dev/null -w "https-script:%{http_code} size:%{size_download}" https://127.0.0.1/_q/script.js -H "Host: quantiviq.xyz"; echo; grep -n "analytics" /etc/nginx/sites-enabled/quantiviq', timeout=60)
print(so.read().decode('utf-8','replace')[:2000])
a.close()