"""Task 8 evidence: run the two mission test questions through the FULL
production code path (service HTTP API + real streaming) — locally.

Run A (standard endpoint): proves the activation path end-to-end; expected
to surface the account's 429 insufficient-balance error cleanly (the exact
production blocker).

Run B (coding endpoint, LOCAL TEST USAGE ONLY — never public traffic):
demonstrates real GLM answers for exactly these two questions: quality,
sources, latency, token usage. NOT presented as public activation.
"""
import json
import re
import subprocess
import sys
import time
import urllib.request
import urllib.error
import os

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
QUESTIONS = [
    ("en", "How would Majid lead AI Transformation in an FMCG group, and what verified work supports his approach?"),
    ("fa", "اگر مجید مسئول تحول هوش مصنوعی یک هلدینگ FMCG باشد، در ۹۰ روز اول چه می‌کند و چه شواهدی از تجربه و رویکرد او وجود دارد؟"),
]

def start_service(env):
    # kill ONLY mind_service pythons (never the parent test process)
    r = subprocess.run(
        ["powershell", "-NoProfile", "-Command",
         "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | "
         "Where-Object { $_.CommandLine -match 'mind_service' } | "
         "ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"],
        capture_output=True)
    e = dict(os.environ)
    e.update(env)
    proc = subprocess.Popen(
        [sys.executable, "public-mind/service/mind_service.py"],
        stdout=open("public-mind/build/srv-test-out.log", "w", encoding="utf-8"),
        stderr=open("public-mind/build/srv-test-err.log", "w", encoding="utf-8"),
        env=e,
    )
    for _ in range(30):
        time.sleep(1)
        try:
            urllib.request.urlopen("http://127.0.0.1:8210/health", timeout=3)
            return proc
        except Exception:
            continue
    raise RuntimeError("service did not start")

def chat(session, locale, q):
    req = urllib.request.Request(
        "http://127.0.0.1:8210/chat",
        data=json.dumps({"session": session, "locale": locale, "messages": [{"role": "user", "content": q}]}).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    t0 = time.time()
    events = []
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            ev = None
            for raw in r:
                line = raw.decode("utf-8").rstrip("\n")
                if line.startswith("event: "):
                    ev = line[7:]
                elif line.startswith("data: ") and ev:
                    events.append((ev, json.loads(line[6:])))
        dt = time.time() - t0
        src = next((d for e, d in events if e == "sources"), {"sources": []})
        ans = "".join(d["text"] for e, d in events if e == "delta")
        done = next((d for e, d in events if e == "done"), {})
        return dt, src, ans, done
    except urllib.error.HTTPError as e:
        return time.time() - t0, {"sources": []}, "", {"status": f"HTTP {e.code}: {e.read().decode('utf-8','replace')[:200]}"}

cred = open(r"C:\Users\ma.asghari\.dsh\.credentials.yaml", encoding="utf-8").read()
key = re.search(r"^ZAI_API_KEY:\s*['\"]?([^'\"\s]+)", cred, re.M).group(1)
base = os.path.abspath("public-mind/build")

print("=========== RUN A — STANDARD endpoint (the activation path) ===========")
proc = start_service({"ZAI_API_KEY": key, "MIND_BASE_URL": "https://api.z.ai/api/paas/v4",
                      "MIND_KNOWLEDGE": f"{base}\\public-knowledge.sqlite",
                      "MIND_USAGE": f"{base}\\usage-stdtest.sqlite"})
for locale, q in QUESTIONS:
    dt, src, ans, done = chat(f"stdtest-{locale}", locale, q)
    print(f"[{locale}] {dt:.1f}s status={done.get('status')} sources={len(src.get('sources', []))} chars={len(ans)}")
    if ans:
        print("  answer(300):", ans[:300].replace("\n", " "))
proc.kill()

print()
print("=========== RUN B — coding endpoint (LOCAL TEST ONLY, not public) ===========")
proc = start_service({"ZAI_API_KEY": key, "MIND_BASE_URL": "https://api.z.ai/api/coding/paas/v4",
                      "MIND_KNOWLEDGE": f"{base}\\public-knowledge.sqlite",
                      "MIND_USAGE": f"{base}\\usage-stdtest.sqlite"})
for locale, q in QUESTIONS:
    dt, src, ans, done = chat(f"ctest-{locale}", locale, q)
    usage = done.get("usage", {})
    print(f"[{locale}] {dt:.1f}s status={done.get('status')} sources={len(src.get('sources', []))} chars={len(ans)} usage={usage}")
    print("  sources:", [s["url"] for s in src.get("sources", [])][:3])
    print("  answer(400):", ans[:400].replace("\n", " "))
proc.kill()

print()
print("=========== usage accounting (token consumption rows) ===========")
import sqlite3
db = sqlite3.connect(f"{base}/usage-stdtest.sqlite")
db.row_factory = sqlite3.Row
for r in db.execute("SELECT session, model, locale, prompt_tokens, completion_tokens, latency_ms, cost_usd, status FROM usage ORDER BY ts"):
    print(dict(r))
