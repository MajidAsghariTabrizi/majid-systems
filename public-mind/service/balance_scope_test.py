"""Scope the 429: account-wide zero balance vs model-specific resource package.
Tests several z.ai models with the new key (auth already proven)."""
import json
import os
import sys
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KEY = os.environ["QUANTIVIQ_NEW_KEY"]
STD = "https://api.z.ai/api/paas/v4"

for model in ["glm-5.3-flash", "glm-4.7-flash", "glm-4.5-flash", "glm-4.5-air", "glm-4.6"]:
    req = urllib.request.Request(
        STD + "/chat/completions",
        data=json.dumps({
            "model": model,
            "messages": [{"role": "user", "content": "Reply with exactly: OK"}],
            "max_tokens": 16,
            "stream": False,
        }).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {KEY}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            obj = json.loads(r.read())
        c = (obj["choices"][0]["message"].get("content") or "")[:20]
        print(f"{model}: HTTP 200 content={c!r} tokens={obj.get('usage', {}).get('total_tokens')}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")[:120]
        print(f"{model}: HTTP {e.code} — {body}")
