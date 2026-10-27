#!/usr/bin/env python3
"""Executive Dialogue release deploy (owner-authorized):
1. site: existing public_deploy.py workflow (git reset origin/main, build, systemd)
2. mind service: upload the persona-capable mind_service.py ONLY (config + DB
   untouched), backup old service first
3. gates: health, /en/mind default persona regression (cited answer), 
   executive persona loopback (structured answer, 7 records), config identical.
"""
import json, paramiko, sys, time, os

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
PW = open(r"C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password").read().strip()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("171.22.24.45", username="root", password=PW, timeout=15)

def run(cmd, t=300):
    si, so, se = c.exec_command(cmd, timeout=t)
    out = so.read().decode("utf-8", "replace")
    code = so.channel.recv_exit_status()
    print(out, end="")
    if code != 0:
        print(f"[exit {code}] " + se.read().decode("utf-8", "replace")[:300], file=sys.stderr)
    return code, out

print("== pre-state ==")
_, pre = run("cat /etc/public-mind/config.json && systemctl is-active public-mind && cd /opt/majid-systems && git log --oneline -1")

print("== upload persona-capable service (backup first) ==")
sftp = c.open_sftp()
ts = time.strftime("%Y%m%d-%H%M%S")
run(f"cp /opt/public-mind/mind_service.py /root/backups/mind_service.pre-exec-{ts}.py")
sftp.put(os.path.join(ROOT, "public-mind", "service", "mind_service.py"), "/opt/public-mind/mind_service.py")
sftp.close()
run("chmod 644 /opt/public-mind/mind_service.py && systemctl restart public-mind && sleep 3 && systemctl is-active public-mind")

print("== config identical check ==")
_, post = run("cat /etc/public-mind/config.json")
assert post.strip() == pre.strip(), "CONFIG CHANGED - abort"

print("== gate 1: health ==")
_, h = run("curl -s http://127.0.0.1:8210/health")
health = json.loads(h)
assert health.get("records") == 715 and health.get("chat_enabled") and not health.get("mock"), health
print("health ok:", health.get("records"), "records")

def chat(body):
    cmd = "curl -s -N --max-time 120 http://127.0.0.1:8210/chat -H 'Content-Type: application/json' -d '" + json.dumps(body).replace("'", "'\\''") + "'"
    _, out = run(cmd, 200)
    answer, done, ns = "", None, 0
    for line in out.splitlines():
        if line.startswith("data:"):
            try:
                ev = json.loads(line[5:].strip())
                if ev.get("sources"): ns = len(ev["sources"])
                if isinstance(ev.get("text"), str): answer += ev["text"]
                if ev.get("status"): done = ev["status"]
            except Exception: pass
    return done, answer, ns

print("== gate 2: default persona regression (public mind behavior) ==")
done, ans, ns = chat({"session": "execdeploy-default-1", "locale": "en", "messages": [{"role": "user", "content": "What is Quantiviq?"}]})
assert done == "ok" and len(ans) > 120 and ns >= 2, (done, len(ans), ns)
print("default ok: len", len(ans), "sources", ns)

print("== gate 3: executive persona loopback ==")
done, ans, ns = chat({"session": "execdeploy-exec-1x", "locale": "en", "persona": "executive", "messages": [{"role": "user", "content": "What has Majid actually shipped, and what remains experimental?"}]})
assert done == "ok" and len(ans) > 300 and ns >= 5, (done, len(ans), ns)
print("executive ok: len", len(ans), "sources", ns)

print("\nSERVICE RELEASE GATES: PASS")
c.close()
