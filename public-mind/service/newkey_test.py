"""Verify the owner's NEW provisioned key against the STANDARD endpoint.
Key arrives via env QUANTIVIQ_NEW_KEY (never printed, never written to git).
Tests: auth, balance (real billable call), thinking param shapes, model identity.
"""
import json
import os
import sys
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KEY = os.environ["QUANTIVIQ_NEW_KEY"]
STD = "https://api.z.ai/api/paas/v4"

def call(label, extra=None, max_tokens=32):
    body = {
        "model": "glm-5.3-flash",
        "messages": [{"role": "user", "content": "Reply with exactly: OK"}],
        "max_tokens": max_tokens,
        "temperature": 0.1,
        "stream": False,
        **(extra or {}),
    }
    req = urllib.request.Request(
        STD + "/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {KEY}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            obj = json.loads(r.read())
        msg = obj["choices"][0]["message"]
        content = (msg.get("content") or msg.get("reasoning_content") or "").strip()
        u = obj.get("usage", {})
        print(f"{label}: HTTP 200 model={obj.get('model')} content={content[:30]!r} "
              f"tokens={u.get('total_tokens')} reasoning={u.get('completion_tokens_details', {}).get('reasoning_tokens')}")
        return True
    except urllib.error.HTTPError as e:
        print(f"{label}: HTTP {e.code} — {e.read().decode('utf-8', 'replace')[:200]}")
        return False
    except Exception as e:
        print(f"{label}: {type(e).__name__}: {e}")
        return False

# invalid-key control (auth gate confirmed reachable)
try:
    req = urllib.request.Request(STD + "/chat/completions",
        data=json.dumps({"model": "glm-5.3-flash", "messages": [{"role": "user", "content": "x"}], "max_tokens": 8}).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer invalid-key-000"}, method="POST")
    urllib.request.urlopen(req, timeout=60)
    print("control: unexpected 200 with invalid key")
except urllib.error.HTTPError as e:
    print(f"control invalid key: HTTP {e.code} (auth gate OK)")

ok_enabled = call("thinking enabled", {"thinking": {"type": "enabled"}})
ok_low = call("thinking type low", {"thinking": {"type": "low"}})
ok_none = call("no thinking param")
ok_effort = call("reasoning_effort low", {"reasoning_effort": "low"})
print()
print("BALANCE/PERMISSION:", "VALID — standard API billing works" if any([ok_enabled, ok_none, ok_effort])
      else "INSUFFICIENT — no usable standard-API balance with this key")
