"""Directive test 1b: 5 real EN/FA RAG questions through the FULL local
service path with glm-4.5-flash on the STANDARD endpoint (new key from
protected file). Measures per-question latency, tokens, cost, grounding,
language match. Includes an idle gap before Q1 to observe cold-start.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KEY = open(r"C:\Users\ma.asghari\.dsh\var\quantiviq-zai.key").read().strip()
BASE = os.path.abspath("public-mind/build")

QUESTIONS = [
    ("en", "How would Majid lead AI Transformation in an FMCG group, and what verified work supports his approach?"),
    ("fa", "اگر مجید مسئول تحول هوش مصنوعی یک هلدینگ FMCG باشد، در ۹۰ روز اول چه می‌کند و چه شواهدی از تجربه و رویکرد او وجود دارد؟"),
    ("en", "Which projects demonstrate his capabilities?"),
    ("fa", "رویکرد مجید چه تفاوتی با صرفاً استفاده از ابزارهای هوش مصنوعی دارد؟"),
    ("en", "What are his core thinking principles?"),
]
FA_RE = re.compile(r"[\u0600-\u06FF]")

def start_service():
    subprocess.run(["powershell", "-NoProfile", "-Command",
         "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | "
         "Where-Object { $_.CommandLine -match 'mind_service' } | "
         "ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"],
        capture_output=True)
    e = dict(os.environ)
    e.update({"ZAI_API_KEY": KEY, "MIND_BASE_URL": "https://api.z.ai/api/paas/v4",
              "MIND_MODEL": "glm-4.5-flash",
              "MIND_KNOWLEDGE": f"{BASE}\\public-knowledge.sqlite",
              "MIND_USAGE": f"{BASE}\\usage-45flash.sqlite"})
    try:
        os.remove(f"{BASE}\\usage-45flash.sqlite")
    except OSError:
        pass
    proc = subprocess.Popen([sys.executable, "public-mind/service/mind_service.py"],
        stdout=open(f"{BASE}/srv-test-out.log", "w", encoding="utf-8"),
        stderr=open(f"{BASE}/srv-test-err.log", "w", encoding="utf-8"), env=e)
    for _ in range(30):
        time.sleep(1)
        try:
            urllib.request.urlopen("http://127.0.0.1:8210/health", timeout=3)
            return proc
        except Exception:
            continue
    raise RuntimeError("service did not start")

def chat(session, locale, q):
    req = urllib.request.Request("http://127.0.0.1:8210/chat",
        data=json.dumps({"session": session, "locale": locale,
                         "messages": [{"role": "user", "content": q}]}).encode(),
        headers={"Content-Type": "application/json"}, method="POST")
    t0 = time.time()
    events = []
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
    return dt, src.get("sources", []), ans, done

proc = start_service()
print("service up (glm-4.5-flash, standard endpoint). idle 150s to test cold-start recurrence…")
time.sleep(150)

lat = []
for i, (locale, q) in enumerate(QUESTIONS, 1):
    dt, sources, ans, done = chat(f"rag45-{i}", locale, q)
    lat.append(dt)
    u = done.get("usage", {})
    fa_chars = len(FA_RE.findall(ans))
    urls = re.findall(r"https?://[^\s<>\")\]]+", ans)
    ok_lang = (fa_chars > 50) if locale == "fa" else (fa_chars < 20)
    grounded = any("quantiviq.xyz" in u2 or "github.com/MajidAsghariTabrizi" in u2 for u2 in urls) or len(sources) >= 1
    print(f"\nQ{i} [{locale}] {dt:5.1f}s status={done.get('status')} sources={len(sources)} chars={len(ans)} tokens={u.get('total_tokens')}")
    print(f"   lang_ok={ok_lang} grounded={grounded} urls={len(urls)}")
    print(f"   answer(220): {ans[:220].replace(chr(10), ' ')}")
    if i < len(QUESTIONS):
        time.sleep(45)  # idle gaps to observe warmup recurrence

s = sorted(lat)
print(f"\nRAG RUN: p50={s[len(s)//2]:.1f}s max={max(lat):.1f}s  (n={len(lat)})")
proc.kill()
