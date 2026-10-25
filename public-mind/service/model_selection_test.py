"""Full billing picture + working-model selection probe (new key, standard endpoint)."""
import json
import os
import sys
import time
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KEY = os.environ["QUANTIVIQ_NEW_KEY"]
STD = "https://api.z.ai/api/paas/v4"

def call(model, extra=None, max_tokens=300, q="Reply with exactly: OK"):
    body = {
        "model": model,
        "messages": [{"role": "user", "content": q}],
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
        content = (msg.get("content") or "").strip()
        u = obj.get("usage", {})
        rt = (u.get("completion_tokens_details") or {}).get("reasoning_tokens")
        return {"ok": True, "model": obj.get("model"), "content": content,
                "tokens": u.get("total_tokens"), "reasoning": rt}
    except urllib.error.HTTPError as e:
        return {"ok": False, "code": e.code, "err": e.read().decode("utf-8", "replace")[:100]}

print("== billing sweep ==")
for m in ["glm-5.3-flash", "glm-5.3", "glm-5.3-air", "glm-4.7-flash", "glm-4.5-flash", "glm-4.5-air", "glm-4.6", "glm-4-flash"]:
    r = call(m, max_tokens=64)
    print(f"  {m}: {'OK tokens=' + str(r['tokens']) if r['ok'] else f'HTTP {r[chr(34)+chr(34)] if False else r[chr(99)+chr(111)+chr(100)+chr(101)]} {r[chr(101)+chr(114)+chr(114)][chr(58)+chr(58)] if False else r['err'][:60]}'}")

print("== glm-4.7-flash retries (1305 transient?) ==")
for i in range(3):
    r = call("glm-4.7-flash", max_tokens=64)
    print(f"  try {i+1}: {'OK tokens=' + str(r['tokens']) if r['ok'] else 'HTTP ' + str(r['code']) + ' ' + r['err'][:60]}")
    if r["ok"]:
        break
    time.sleep(3)

print("== thinking disable support on billable flash models ==")
for m in ["glm-4.5-flash", "glm-4.7-flash"]:
    r = call(m, {"thinking": {"type": "disabled"}}, q="What is 2+2? Answer with just the number.")
    print(f"  {m} thinking-disabled: {'OK content=' + repr(r['content'][:30]) + ' reasoning=' + str(r['reasoning']) if r['ok'] else 'HTTP ' + str(r['code']) + ' ' + r['err'][:60]}")
    r2 = call(m, q="What is 2+2? Answer with just the number.")
    print(f"  {m} default:          {'OK content=' + repr(r2['content'][:30]) + ' reasoning=' + str(r2['reasoning']) if r2['ok'] else 'HTTP ' + str(r2['code']) + ' ' + r2['err'][:60]}")
