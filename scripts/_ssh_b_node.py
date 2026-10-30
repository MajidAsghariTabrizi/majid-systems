import os, paramiko
KEY = os.path.expanduser('~/.ssh/trader_vps')
cl = paramiko.SSHClient(); cl.set_missing_host_key_policy(paramiko.AutoAddPolicy())
cl.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=25, look_for_keys=False, allow_agent=False)
for tag, cmd in [('node', 'node -v 2>/dev/null; npm -v 2>/dev/null; which node'), ('pg', 'ls /usr/lib/postgresql/ 2>/dev/null; systemctl is-active postgresql 2>/dev/null'), ('snap', 'snap list 2>/dev/null | head -4')]:
    _, so, se = cl.exec_command(cmd, timeout=60)
    print('===== ' + tag + ' ====='); print(so.read().decode('utf-8','replace').strip() or '(empty)'); e = se.read().decode('utf-8','replace').strip()
    if e: print('(stderr)', e[:200])
cl.close()