"""Test GLM thinking-control parameters + higher output budget."""
import json
import re
import sys
import os
import time
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
cred = open(r"C:\Users\ma.asghari\.dsh\.credentials.yaml", encoding="utf-8").read()
key = re.search(r"^ZAI_API_KEY:\s*['\"]?([^'\"\s]+)", cred, re.M).group(1)

def call(extra, label, q="How would Majid approach AI transformation in a large company? Answer in 150 words."):
    req = urllib.request.Request(
        "https://api.z.ai/api/coding/paas/v4/chat/completions",
        data=json.dumps({
            "model": "glm-5.3-flash",
            "messages": [{"role": "user", "content": q}],
            "max_tokens": 900,
            "temperature": 0.6,
            "stream": False,
            **extra,
        }).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            obj = json.loads(r.read())
        u = obj.get("usage", {})
        txt = obj["choices"][0]["message"].get("content") or ""
        rt = u.get("completion_tokens_details", {}).get("reasoning_tokens", "?")
        print(f"{label}: {time.time()-t0:.1f}s chars={len(txt)} completion={u.get('completion_tokens')} reasoning={rt}")
        print("  first 120:", txt[:120].replace(chr(10), " "))
    except urllib.error.HTTPError as e:
        print(f"{label}: HTTP {e.code} — {e.read()[:200]}")

call({}, "baseline (thinking default)")
call({"thinking": {"type": "disabled"}}, "thinking disabled")
