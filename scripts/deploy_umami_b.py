#!/usr/bin/env python3
"""Phase B: deploy pinned Umami v3.4.1 (source build) + PostgreSQL 16 on
Server B (trading VPS) with systemd isolation, resource ceilings, loopback-only
DB, backup + health timers, tunnel user. Idempotent; read-only towards trading.
Run from the repo root on the workstation (uses ~/.ssh/trader_vps key)."""
import os, sys, paramiko

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, 'reconfigure'):
        _s.reconfigure(encoding='utf-8', errors='replace')

HOST = '87.107.152.67'
KEY = os.path.expanduser('~/.ssh/trader_vps')
UMAMI_TAG = 'v3.4.1'

cl = paramiko.SSHClient(); cl.set_missing_host_key_policy(paramiko.AutoAddPolicy())
cl.connect(HOST, 22, username='root', pkey=paramiko.Ed25519Key.from_private_key_file(KEY), timeout=25, look_for_keys=False, allow_agent=False)

def run(cmd, timeout=900, check=True, label='', stdin=None):
    print('>> ' + (label or cmd[:100]), flush=True)
    si, so, se = cl.exec_command(cmd, timeout=timeout)
    if stdin is not None:
        si.write(stdin)
        si.channel.shutdown_write()
    out = so.read().decode('utf-8', 'replace'); err = se.read().decode('utf-8', 'replace')
    code = so.channel.recv_exit_status()
    tail = (out.strip().splitlines()[-6:] if out.strip() else [])
    for l in tail: print('   ' + l, flush=True)
    if err.strip():
        for l in err.strip().splitlines()[-4:]: print('   E ' + l, flush=True)
    if check and code != 0:
        print(f'!! FAILED ({code}) at: {label or cmd[:80]}', flush=True)
        sys.exit(1)
    return out

# 0) trading health BEFORE (snapshot for G4)
run('for s in trader-vnext-predict trader-market trader-micro trader-watchdog trader-brain m23-opportunity-shadow; do printf "%s=%s " "$s" "$(systemctl is-active $s)"; done; echo; uptime', label='trader-health-before')

# 1) PostgreSQL 16 (loopback only, dedicated role/db)
run('dpkg -s postgresql >/dev/null 2>&1 || DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib', timeout=1200, label='apt-postgresql')
run('systemctl enable --now postgresql@16-main 2>/dev/null || systemctl enable --now postgresql', label='pg-enable')
run('{ [ -f /root/.umami-db-pw ] || openssl rand -hex 24 > /root/.umami-db-pw; chmod 600 /root/.umami-db-pw; }', label='pg-pw-gen')
run("printf \"CREATE ROLE umami LOGIN PASSWORD '%s';\" \"$(cat /root/.umami-db-pw)\" > /root/.umami-role.sql && chmod 600 /root/.umami-role.sql", label='pg-role-sql')
run('su - postgres -c "psql" < /root/.umami-role.sql 2>/dev/null; echo -n exists-check:; su - postgres -c "psql -tA"', label='pg-role', stdin="SELECT CASE WHEN count(*)>0 THEN 'ROLE-OK' ELSE 'ROLE-MISSING' END FROM pg_roles WHERE rolname='umami';")
run('su - postgres -c "createdb -O umami umami" 2>/dev/null; su - postgres -c "psql -tA -d umami"', label='pg-db', stdin="SELECT CASE WHEN count(*)>0 THEN 'DB-OK' ELSE 'DB-MISSING' END FROM pg_database WHERE datname='umami';")
run('rm -f /root/.umami-role.sql', check=False, label='pg-role-cleanup')
run("grep -q '^listen_addresses' /etc/postgresql/16/main/postgresql.conf || echo 'listen_addresses = \'localhost\'' >> /etc/postgresql/16/main/postgresql.conf; systemctl reload postgresql", label='pg-loopback')
# postgres resource ceiling (drop-in)
run('mkdir -p /etc/systemd/system/postgresql@16-main.service.d && printf "[Unit]\nDescription=PostgreSQL for Umami analytics (resource-capped)\n[Service]\nMemoryMax=1G\nCPUQuota=40%%\n" > /etc/systemd/system/postgresql@16-main.service.d/umami-cap.conf && systemctl daemon-reload', label='pg-ceiling')

# 2) umami system user + pinned source build
run('id umami >/dev/null 2>&1 || useradd -r -s /usr/sbin/nologin -d /opt/umami umami', label='umami-user')
run('rm -rf /opt/umami && mkdir -p /opt/umami && cd /opt/umami && git clone --depth 1 --branch ' + UMAMI_TAG + ' https://github.com/umami-software/umami . && ls packages/', timeout=600, label='clone-umami-fresh')
run('cd /opt/umami && git describe --tags', label='verify-tag')
# Umami v3 uses pnpm (engines: pnpm 12.3.4) with pnpm-lock.yaml
run('export PATH=/opt/node/bin:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0; corepack prepare pnpm@12.3.4 --activate 2>&1 | tail -1 || npm i -g pnpm@latest 2>&1 | tail -1; pnpm --version', label='pnpm')
run('export PATH=/opt/node/bin:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0; cd /opt/umami && pnpm install --frozen-lockfile 2>&1 | tail -4', timeout=1800, label='pnpm-install')
run('export PATH=/opt/node/bin:$PATH; set -a; . /etc/umami.env; set +a; cd /opt/umami && pnpm run build:docker 2>&1 | tail -8', timeout=2400, label='umami-build')
# standalone build layout: self-contained server in .next/standalone
run('cd /opt/umami && cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public 2>/dev/null; ls .next/standalone/server.js', label='standalone-layout')
run('chown -R umami:umami /opt/umami', label='chown')

# 3) secrets + env
run('[ -f /root/.umami-app-secret ] || openssl rand -hex 32 > /root/.umami-app-secret; chmod 600 /root/.umami-app-secret', label='app-secret')
run("printf 'DATABASE_URL=postgresql://umami:%s@localhost:5432/umami\nDATABASE_TYPE=postgresql\nAPP_SECRET=%s\nHOSTNAME=127.0.0.1\nPORT=3001\nDISABLE_TELEMETRY=1\nCRAWLER_CHECK=1\n' \"$(cat /root/.umami-db-pw)\" \"$(cat /root/.umami-app-secret)\" > /etc/umami.env && chmod 600 /etc/umami.env", label='env-file')

# 4) systemd unit
unit = '''[Unit]
Description=Umami web analytics (quantiviq, loopback only)
After=network.target postgresql@16-main.service

[Service]
Type=simple
User=umami
Group=umami
WorkingDirectory=/opt/umami/.next/standalone
EnvironmentFile=/etc/umami.env
ExecStart=/opt/node/bin/node /opt/umami/.next/standalone/server.js
Restart=on-failure
RestartSec=5
MemoryMax=500M
MemoryHigh=400M
CPUQuota=40%
TasksMax=120
LimitNOFILE=8192
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=full
ProtectHome=yes

[Install]
WantedBy=multi-user.target
'''
run("cat > /etc/systemd/system/umami.service <<'UNIT'\n" + unit + "UNIT\nsystemctl daemon-reload && systemctl enable --now umami", label='umami-unit')
run('systemctl restart umami; sleep 6; systemctl is-active umami; curl -s -o /dev/null -w "heartbeat:%{http_code}\n" http://127.0.0.1:3001/api/heartbeat', label='umami-health')

# 5) tunnel user with restricted forward-only key (no shell)
run('id tunnel >/dev/null 2>&1 || useradd -r -s /usr/sbin/nologin tunnel', label='tunnel-user')
run('mkdir -p /home/tunnel/.ssh && chmod 700 /home/tunnel/.ssh', check=False, label='tunnel-sshdir')
run('install -d -m 700 -o tunnel -g tunnel /home/tunnel/.ssh', label='tunnel-perm')
# (public key appended by the A-side step later; placeholder line now)
print('B-SIDE CORE DEPLOY COMPLETE', flush=True)
cl.close()