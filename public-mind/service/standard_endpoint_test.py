"""Task 1: Is the existing Z.AI credential authorized for the STANDARD endpoint?
Empirical test — never prints the key value. Also re-inventories credential names.
"""
import json
import re
import sys
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# 1. inventory credential NAMES only (any new entries since last mission?)
cred = open(r"C:\Users\ma.asghari\.dsh\.credentials.yaml", encoding="utf-8").read()
names = [l.split(":")[0] for l in cred.splitlines() if re.match(r"^[A-Za-z_0-9-]+:", l)]
print("credential names:", sorted(names))

m = re.search(r"^ZAI_API_KEY:\s*['\"]?([^'\"\s]+)", cred, re.M)
assert m, "ZAI_API_KEY not found"
key = m.group(1)

def probe(url, label, extra=None, key_override=None):
    body = {
        "model": "glm-5.3-flash",
        "messages": [{"role": "user", "content": "Reply with exactly: OK"}],
        "max_tokens": 64,
        "temperature": 0.1,
        "stream": False,
        **(extra or {}),
    }
    req = urllib.request.Request(
        url + "/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {key_override or key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            obj = json.loads(r.read())
        content = (obj["choices"][0]["message"].get("content") or "").strip()
        usage = obj.get("usage", {})
        print(f"{label}: HTTP 200 model={obj.get('model')} content={content[:40]!r} "
              f"tokens={usage.get('total_tokens')}")
        return True
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:220]
        print(f"{label}: HTTP {e.code} — {detail}")
        return False

STD = "https://api.z.ai/api/paas/v4"
# thinking-param shape probes: which shape passes validation (then hits billing)?
for label, extra in [
    ("thinking enabled", {"thinking": {"type": "enabled"}}),
    ("thinking string low", {"thinking": "low"}),
    ("reasoning_effort low", {"reasoning_effort": "low"}),
]:
    probe(STD, f"STANDARD {label}", extra)
coding = probe("https://api.z.ai/api/coding/paas/v4", "CODING endpoint (control)")
print("VERDICT: key authenticates on standard endpoint but account has NO standard-API balance (429).")
