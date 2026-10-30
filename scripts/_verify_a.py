import io, paramiko, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
def run(cmd, t=300):
    import time
    time.sleep(2)
    _, so, se = a.exec_command(cmd, timeout=t)
    out = so.read().decode('utf-8','replace')
    return out.strip()
print('env:', run('ls -la /opt/majid-systems/.env.production 2>&1; cat /opt/majid-systems/.env.production 2>&1 | head -2; grep -r "24264632" /opt/majid-systems/.next/server/app/en.html 2>/dev/null | head -1; grep -rl "24264632" /opt/majid-systems/.next/static/chunks/ 2>/dev/null | head -2; grep -c "_q/script.js" /opt/majid-systems/.next/server/app/en.html 2>/dev/null'))
print('build-id:', run('cd /opt/majid-systems && git log -1 --format=%H'))
print('svc:', run('systemctl is-active majid-systems; systemctl show majid-systems -p ExecMainStartTimestamp'))
print('unit:', run('cat /etc/systemd/system/majid-systems.service | head -12'))
a.close()