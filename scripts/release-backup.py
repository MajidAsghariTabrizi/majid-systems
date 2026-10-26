#!/usr/bin/env python3
"""Release backup before silver-bullet deploy (owner-authorized).
Backs up on the VPS to /root/backups/pre-silver-bullet-<ts>/:
  - /opt/majid-systems git HEAD + build identity (tar of .next excluded; git SHA recorded; full source tar)
  - /etc/public-mind/{config.json,env}
  - /opt/public-mind/{mind_service.py,public-knowledge.sqlite}
  - /etc/nginx/sites-available/quantiviq + systemd units
Prints the backup manifest. Rollback procedure lives in DEPLOY_AND_ROLLBACK_PLAN.md.
"""
import os, sys, paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
PW = open(r"C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password").read().strip()
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("171.22.24.45", username="root", password=PW, timeout=15)

def run(cmd, t=600):
    si, so, se = c.exec_command(cmd, timeout=t)
    out, err = so.read().decode("utf-8", "replace"), se.read().decode("utf-8", "replace")
    code = so.channel.recv_exit_status()
    print(out, end="")
    if code != 0:
        print(f"[exit {code}] {err[:400]}", file=sys.stderr)
    return code, out

print("== current release identity ==")
run("cd /opt/majid-systems && git log --oneline -1 && systemctl is-active majid-systems && systemctl is-active public-mind")

print("== backup ==")
run("TS=$(date +%Y%m%d-%H%M%S); BK=/root/backups/pre-silver-bullet-$TS; mkdir -p $BK && "
    "cd /opt/majid-systems && git rev-parse HEAD > $BK/site-git-sha.txt && "
    "tar czf $BK/site-source.tar.gz --exclude=.next --exclude=node_modules . && "
    "tar czf $BK/site-next-build.tar.gz .next 2>/dev/null || echo '(no .next)' && "
    "cp /etc/public-mind/config.json /etc/public-mind/env $BK/ 2>/dev/null; "
    "cp /opt/public-mind/mind_service.py /opt/public-mind/public-knowledge.sqlite $BK/ 2>/dev/null; "
    "cp /etc/nginx/sites-available/quantiviq $BK/nginx-quantiviq.conf 2>/dev/null; "
    "cp /etc/systemd/system/majid-systems.service /etc/systemd/system/public-mind.service $BK/ 2>/dev/null; "
    "ls -la $BK > $BK/MANIFEST.txt && cat $BK/MANIFEST.txt && echo BACKUP_DIR=$BK")
c.close()
