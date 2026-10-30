import os, paramiko, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
KEY = os.path.expanduser('~/.ssh/trader_vps')
cl = paramiko.SSHClient(); cl.set_missing_host_key_policy(paramiko.AutoAddPolicy())
cl.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=25, look_for_keys=False, allow_agent=False)
_, so, se = cl.exec_command('export PATH=/opt/node/bin:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0; cd /opt/umami && cat package.json | head -30; ls packages/; yarn install 2>&1 | tail -25', timeout=900)
print(so.read().decode('utf-8','replace'))
cl.close()