#!/usr/bin/env python3
"""Release deploy of the Public Mind service (owner-authorized).
- uploads the new scope-aware mind_service.py + rebuilt 715-record knowledge DB
- PRESERVES the currently-live /etc/public-mind/{config.json,env} (chat ENABLED,
  working key) — reads them back, never overwrites
- backs up remote DB to /root/backups/pre-silver-bullet-*/ (already taken)
- restarts public-mind, then GATES on: health OK, record count 715, scope
  filter works, and a REAL loopback GLM chat round-trip returns a complete
  grounded answer with citations.
"""
import json, os, sys, time, paramiko

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
PW = open(r"C:\Users\ma.asghari\.dsh\var\quantiviq-ssh.password").read().strip()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
c = paramiko.SSHClient(); c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("171.22.24.45", username="root", password=PW, timeout=15)

def run(cmd, t=300):
    si, so, se = c.exec_command(cmd, timeout=t)
    out, err = so.read().decode("utf-8", "replace"), se.read().decode("utf-8", "replace")
    code = so.channel.recv_exit_status()
    print(out, end="")
    if code != 0: print(f"[exit {code}] {err[:300]}", file=sys.stderr)
    return code, out

print("== pre-state (must be preserved) ==")
_, pre = run("systemctl is-active public-mind && cat /etc/public-mind/config.json")
pre_cfg = json.loads(pre[pre.index("{"):])

print("== upload code + knowledge DB ==")
sftp = c.open_sftp()
ts = time.strftime("%Y%m%d-%H%M%S")
run(f"cp /opt/public-mind/public-knowledge.sqlite /opt/public-mind/public-knowledge.sqlite.bak-{ts}")
sftp.put(os.path.join(ROOT, "public-mind", "service", "mind_service.py"), "/opt/public-mind/mind_service.py")
sftp.put(os.path.join(ROOT, "public-mind", "build", "public-knowledge.sqlite"), "/opt/public-mind/public-knowledge.sqlite")
sftp.close()
run("chmod 644 /opt/public-mind/mind_service.py /opt/public-mind/public-knowledge.sqlite")

print("== config check (unchanged?) ==")
_, post = run("cat /etc/public-mind/config.json")
post_cfg = json.loads(post[post.index("{"):])
assert post_cfg == pre_cfg, f"CONFIG CHANGED - abort: {pre_cfg} -> {post_cfg}"
print("config identical (chat_enabled=%s model=%s)" % (post_cfg.get("chat_enabled"), post_cfg.get("model")))

print("== restart + health gate ==")
run("systemctl restart public-mind && sleep 3 && systemctl is-active public-mind")
_, h = run("curl -s http://127.0.0.1:8210/health")
health = json.loads(h)
print("health:", json.dumps({k: health.get(k) for k in ("status", "records", "mock", "chat_enabled", "version", "model")}))
assert health.get("records") == 715, f"record count {health.get('records')} != 715"
assert health.get("chat_enabled") is True and health.get("mock") is False, "chat not live"

print("== scope filter gate (loopback) ==")
body = json.dumps({"session": "release-scope-gate", "locale": "en", "scope": "books", "messages": [{"role": "user", "content": "Which edition of Rewired is referenced?"}]})
cmd = "curl -s -N --max-time 60 http://127.0.0.1:8210/chat -H 'Content-Type: application/json' -d '" + body.replace("'", "'\''") + "'"
_, sse = run(cmd)
types = set()
answer = ""
for line in sse.splitlines():
    if line.startswith("data:"):
        try:
            ev = json.loads(line[5:].strip())
            if ev.get("sources"): types = {s["type"] for s in ev["sources"]}
            if isinstance(ev.get("text"), str): answer += ev["text"]
        except Exception: pass
print("scope=books types:", types, "| answerLen:", len(answer))
assert types == {"book"}, f"scope filter wrong: {types}"

print("== REAL chat gate (glm-4.5-flash) ==")
body = json.dumps({"session": "release-real-gate", "locale": "en", "messages": [{"role": "user", "content": "In one sentence: what does the Quantiviq workflow atlas cover?"}]})
cmd = "curl -s -N --max-time 90 http://127.0.0.1:8210/chat -H 'Content-Type: application/json' -d '" + body.replace("'", "'\''") + "'"
_, sse2 = run(cmd)
answer2, done, sources2 = "", False, 0
for line in sse2.splitlines():
    if line.startswith("data:"):
        try:
            ev = json.loads(line[5:].strip())
            if ev.get("sources"): sources2 = len(ev["sources"])
            if isinstance(ev.get("text"), str): answer2 += ev["text"]
            if ev.get("status") == "ok": done = True
        except Exception: pass
print("real answer len:", len(answer2), "| done:", done, "| sources:", sources2)
print("answer:", answer2[:220].replace("\n", " "))
assert done and len(answer2) > 40 and sources2 >= 2, "real chat gate failed"
print("\nMIND RELEASE GATE: PASS (715 records, scopes live, real GLM answering, config preserved)")
c.close()
