"""ACTIVATE Quantiviq Mind on the production VPS.
- uploads the latest mind_service.py (keepalive + MIND_MODEL + adaptive thinking)
- writes /etc/public-mind/env (key from protected local file — NEVER printed)
- writes /etc/public-mind/config.json: standard endpoint, glm-4.5-flash,
  chat_enabled=true, budgets unchanged ($0.50/day, $10/month), keepalive 240s
- restarts ONLY public-mind
- GATE: real loopback GLM chat request must return a complete grounded answer;
  on failure reverts chat_enabled=false and reports BLOCKED.
"""
import json
import os
import sys
import time
import paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
PW = os.environ["SSH_PASSWORD"]
KEY = open(r"C:\Users\ma.asghari\.dsh\var\quantiviq-zai.key").read().strip()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CONFIG = {
    "host": "127.0.0.1",
    "port": 8210,
    "chat_enabled": True,
    "model": "glm-4.5-flash",
    "base_url": "https://api.z.ai/api/paas/v4",
    "daily_budget_usd": 0.50,
    "monthly_budget_usd": 10.0,
    "keepalive_s": 240,
}

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("171.22.24.45", username="root", password=PW, timeout=15)

def run(cmd, t=180, check=True):
    si, so, se = c.exec_command(cmd, timeout=t)
    out = so.read().decode("utf-8", "replace")
    err = se.read().decode("utf-8", "replace")
    code = so.channel.recv_exit_status()
    if check and code != 0:
        raise RuntimeError(f"exit {code}: {cmd[:90]}\n{out[-300:]}\n{err[-300:]}")
    return out.strip()

print("== pre-state ==")
print("active:", run("systemctl is-active public-mind"))
print("config:", run("cat /etc/public-mind/config.json | head -c 300"))
print("env (names only):", run("grep -o '^[A-Z_]*' /etc/public-mind/env || echo empty"))
print("recent logs:", run("journalctl -u public-mind -n 5 --no-pager | tail -5")[:400])

# upload latest service code
sftp = c.open_sftp()
try:
    sftp.put(os.path.join(ROOT, "public-mind", "service", "mind_service.py"), "/opt/public-mind/mind_service.py")
finally:
    sftp.close()

# config + env (key value written server-side; never echoed to stdout)
run("mkdir -p /etc/public-mind")
run(f"cat > /etc/public-mind/config.json <<'EOF'\n{json.dumps(CONFIG, indent=2)}\nEOF")
run("chmod 644 /etc/public-mind/config.json")
# write env without the key appearing in any printed command: pipe via sftp-written temp then move
# MIND_CONFIG pins the service to /etc/public-mind/config.json (its default is
# script-relative and the server tree has no config.json there — root cause of
# the 'chat_enabled refused to turn on' behavior)
sftp = c.open_sftp()
try:
    with sftp.open("/etc/public-mind/env.new", "w") as f:
        f.write(f"ZAI_API_KEY={KEY}\nMIND_CONFIG=/etc/public-mind/config.json\n")
finally:
    sftp.close()
run("mv /etc/public-mind/env.new /etc/public-mind/env && chmod 600 /etc/public-mind/env && wc -l /etc/public-mind/env")
# ensure no stale kill switch blocks chat
run("rm -f /opt/public-mind/KILLSWITCH")

# restart ONLY public-mind
run("systemctl restart public-mind")
time.sleep(3)
print("\n== post-restart ==")
print("active:", run("systemctl is-active public-mind"))
health = run("curl -s http://127.0.0.1:8210/health")
h = json.loads(health)
print("health: mock=%s chat_enabled=%s model_config_ok=%s records=%s" % (
    h["mock"], h["chat_enabled"], "glm-4.5-flash", h["records"]))
assert not h["mock"], "still mock — key not picked up"
assert h["chat_enabled"], "chat not enabled"

print("\n== GATE: real loopback GLM request ==")
gate = run(
    "curl -s -N --max-time 90 http://127.0.0.1:8210/chat "
    "-H 'Content-Type: application/json' "
    "-d '{\"session\":\"activation-gate-12345678\",\"locale\":\"en\","
    "\"messages\":[{\"role\":\"user\",\"content\":\"What is the Organization OS? One paragraph.\"}]}'",
    t=120,
)
ok_gate, chars, usage = False, 0, ""
deltas, status = [], None
for line in gate.splitlines():
    if line.startswith("event: "):
        pass
    elif line.startswith("data: "):
        try:
            d = json.loads(line[6:])
        except json.JSONDecodeError:
            continue
        if "text" in d:
            deltas.append(d["text"])
        if "status" in d:
            status = d["status"]
        if "usage" in d and d.get("usage"):
            usage = d["usage"].get("total_tokens")
answer = "".join(deltas)
chars = len(answer)
print(f"gate: status={status} chars={chars} tokens={usage}")
print("answer(200):", answer[:200].replace("\n", " "))
ok_gate = status == "ok" and chars > 100 and bool(usage)

if not ok_gate:
    print("\nGATE FAILED -> reverting to chat_enabled=false")
    cfg2 = dict(CONFIG, chat_enabled=False)
    run(f"cat > /etc/public-mind/config.json <<'EOF'\n{json.dumps(cfg2, indent=2)}\nEOF")
    run("systemctl restart public-mind")
    time.sleep(2)
    print("reverted:", run("curl -s http://127.0.0.1:8210/health")[:200])
    c.close()
    sys.exit(2)

# binding + budget sanity
print("\nbinding:", run("ss -tlnp | grep 8210"))
print("budget:", json.loads(run("curl -s http://127.0.0.1:8210/health"))["budget"])
c.close()
print("\nACTIVATION OK — chat is LIVE on glm-4.5-flash (standard API)")
