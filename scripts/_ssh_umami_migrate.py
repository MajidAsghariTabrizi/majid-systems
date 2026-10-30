import os, paramiko, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'): _s.reconfigure(encoding='utf-8', errors='replace')
KEY = os.path.expanduser('~/.ssh/trader_vps')
cl = paramiko.SSHClient(); cl.set_missing_host_key_policy(paramiko.AutoAddPolicy())
cl.connect('87.107.152.67', 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=25, look_for_keys=False, allow_agent=False)
cmd = 'export PATH=/opt/node/bin:$PATH; set -a; . /etc/umami.env; set +a; cd /opt/umami && grep -r "model User" prisma/schema.prisma | head -2; grep -rn "@@map" prisma/schema.prisma | head -4; su - postgres -c "psql -tA -d umami -c \\"select table_name from information_schema.tables where table_schema=public order by 1 limit 20\\\""'
_, so, se = cl.exec_command(cmd, timeout=600)
print((so.read().decode('utf-8','replace') + se.read().decode('utf-8','replace'))[:1200])
cl.close()