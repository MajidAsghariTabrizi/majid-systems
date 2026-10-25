"""Directive test 1: glm-4.5-flash on STANDARD API — 10 short calls.
Key read from C:\\Users\\ma.asghari\\.dsh\\var\\quantiviq-zai.key (never printed).
"""
import json
import statistics
import sys
import time
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KEY = open(r"C:\Users\ma.asghari\.dsh\var\quantiviq-zai.key").read().strip()
STD = "https://api.z.ai/api/paas/v4"

lat, ok, total_tokens = [], 0, 0
for i in range(10):
    t0 = time.time()
    req = urllib.request.Request(
        STD + "/chat/completions",
        data=json.dumps({
            "model": "glm-4.5-flash",
            "messages": [{"role": "user", "content": f"Say the word: ready{i}"}],
            "max_tokens": 24,
            "temperature": 0.1,
            "stream": False,
            "thinking": {"type": "disabled"},
        }).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {KEY}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            obj = json.loads(r.read())
        dt = time.time() - t0
        lat.append(dt)
        ok += 1
        total_tokens += obj.get("usage", {}).get("total_tokens", 0)
        c = (obj["choices"][0]["message"].get("content") or "").strip()[:16]
        print(f"  call {i+1:2d}: OK {dt:5.1f}s  {c!r}")
    except Exception as e:
        print(f"  call {i+1:2d}: FAIL {type(e).__name__} {str(e)[:60]} ({time.time()-t0:.1f}s)")
    time.sleep(0.8)

if lat:
    s = sorted(lat)
    p50 = s[len(s) // 2]
    p95 = s[min(len(s) - 1, int(len(s) * 0.95))]
    print(f"\nRELIABILITY: {ok}/10  p50={p50:.1f}s  p95={p95:.1f}s  max={max(lat):.1f}s  tokens_total={total_tokens}")
    print("VERDICT:", "STABLE" if ok >= 9 and p95 <= 15 else "UNSTABLE/TOO SLOW")
else:
    print("\nRELIABILITY: 0/10 — NOT VIABLE")
