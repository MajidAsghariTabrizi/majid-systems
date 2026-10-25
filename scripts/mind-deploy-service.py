#!/usr/bin/env python3
"""Deploy the public-mind service (SERVER B, loopback) on the web VPS.

Steps (all additive, no nginx changes, no site changes):
  1. upload service code + knowledge snapshot to /opt/public-mind
  2. write /etc/public-mind/{config.json,env} (0600) — chat stays DISABLED
     until the owner puts a standard ZAI_API_KEY there
  3. install systemd unit, enable + start
  4. health check on 127.0.0.1:8210

Idempotent: safe to re-run. Rollback: systemctl disable --now public-mind
&& rm -rf /opt/public-mind /etc/systemd/system/public-mind.service.
"""
import os
import sys
import posixpath
import stat
import paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
HOST = "171.22.24.45"
PW = os.environ["SSH_PASSWORD"]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # repo root
LOCAL_SERVICE = os.path.join(ROOT, "public-mind", "service")
LOCAL_DB = os.path.join(ROOT, "public-mind", "build", "public-knowledge.sqlite")

REMOTE_DIR = "/opt/public-mind"
CONFIG = {
    "host": "127.0.0.1",
    "port": 8210,
    "chat_enabled": False,
    "model": "glm-5.3-flash",
    "base_url": "https://api.z.ai/api/paas/v4",
    "daily_budget_usd": 0.50,
    "monthly_budget_usd": 10.0,
}

UNIT = """[Unit]
Description=Quantiviq Public Mind (public brain RAG, loopback only)
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/public-mind
EnvironmentFile=/etc/public-mind/env
ExecStart=/usr/bin/python3 /opt/public-mind/mind_service.py
Restart=on-failure
RestartSec=3
# hardening
NoNewPrivileges=yes
ProtectSystem=strict
ReadWritePaths=/opt/public-mind
PrivateTmp=yes
MemoryMax=96M

[Install]
WantedBy=multi-user.target
"""

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username="root", password=PW, timeout=15)

def run(cmd, check=True):
    si, so, se = c.exec_command(cmd, timeout=120)
    out = so.read().decode("utf-8", "replace").strip()
    err = se.read().decode("utf-8", "replace").strip()
    code = so.channel.recv_exit_status()
    if check and code != 0:
        raise RuntimeError(f"cmd failed ({code}): {cmd}\n{out}\n{err}")
    return out

def upload(local, remote):
    sftp = c.open_sftp()
    try:
        try:
            sftp.stat(posixpath.dirname(remote))
        except FileNotFoundError:
            sftp.mkdir(posixpath.dirname(remote))
        sftp.put(local, remote)
    finally:
        sftp.close()

import json
print(run("mkdir -p /opt/public-mind /etc/public-mind"))
# keep the previous snapshot for one-step knowledge rollback
run(f"test -f {REMOTE_DIR}/public-knowledge.sqlite && cp {REMOTE_DIR}/public-knowledge.sqlite {REMOTE_DIR}/public-knowledge.sqlite.prev || true")
upload(os.path.join(LOCAL_SERVICE, "mind_service.py"), f"{REMOTE_DIR}/mind_service.py")
upload(LOCAL_DB, f"{REMOTE_DIR}/public-knowledge.sqlite")

# config + env (never any key value here)
run(f"cat > /etc/public-mind/config.json <<'EOF'\n{json.dumps(CONFIG, indent=2)}\nEOF")
run("test -f /etc/public-mind/env || printf 'ZAI_API_KEY=\\nMIND_CONFIG=/etc/public-mind/config.json\\n' > /etc/public-mind/env")
run("grep -q '^MIND_CONFIG=' /etc/public-mind/env || printf 'MIND_CONFIG=/etc/public-mind/config.json\\n' >> /etc/public-mind/env")
run("chmod 600 /etc/public-mind/config.json /etc/public-mind/env")

# unit
run(f"cat > /etc/systemd/system/public-mind.service <<'EOF'\n{UNIT}\nEOF")
run("systemctl daemon-reload && systemctl enable public-mind >/dev/null 2>&1; systemctl restart public-mind")
import time
time.sleep(3)
status = run("systemctl is-active public-mind")
print("service:", status)
health = run("curl -s http://127.0.0.1:8210/health")
print("health:", health)
# verify NOT publicly exposed
ext = run("ss -tlnp | grep 8210 || echo loopback-only")
print("binding:", ext)
c.close()
print("PUBLIC-MIND DEPLOY DONE")
