import io, paramiko, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
cmd = 'bash -x /usr/local/bin/umami-pull-backup.sh 2>&1 | tail -8'
_, so, _ = a.exec_command(cmd, timeout=180)
print(so.read().decode('utf-8','replace')[:900])
a.close()