import io, paramiko, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
pw = io.open(r'C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password', encoding='utf-8').read().strip()
a = paramiko.SSHClient(); a.set_missing_host_key_policy(paramiko.AutoAddPolicy())
a.connect('171.22.24.45', 22, username='root', password=pw, timeout=15)
import os
KEYB = os.path.expanduser('~/.ssh/trader_vps')
b = paramiko.SSHClient(); b.set_missing_host_key_policy(paramiko.AutoAddPolicy())
b.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEYB), timeout=25, look_for_keys=False, allow_agent=False)
_, so, _ = b.exec_command('chsh -s /bin/bash tunnel && echo shell-ok', timeout=60)
print(so.read().decode())
b.close()
_, so, se = a.exec_command('ssh -i /root/.ssh/umami_pull -o StrictHostKeyChecking=accept-new tunnel@87.107.152.67 list-latest 2>&1; echo RC=$?; bash /usr/local/bin/umami-pull-backup.sh; ls -la /var/backups/umami-copy/ | tail -2', timeout=180)
print(so.read().decode('utf-8','replace')[:800])
print(so.read().decode('utf-8','replace')[:600])
a.close()