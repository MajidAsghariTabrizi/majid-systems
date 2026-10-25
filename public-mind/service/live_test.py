"""Bounded LIVE test against GLM via the existing Z.AI credential.
Coding-Plan endpoint, LOCAL test usage only — never production traffic.
Loads ZAI_API_KEY from the DSH credential store without printing it."""
import json
import sys
import time
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.path.insert(0, "public-mind/service")

# --- load key silently
import re
cred = open(r"C:\Users\ma.asghari\.dsh\.credentials.yaml", encoding="utf-8").read()
m = re.search(r"^ZAI_API_KEY:\s*['\"]?([^'\"\s]+)", cred, re.M)
assert m, "ZAI_API_KEY not found in credential store"
import os
os.environ["ZAI_API_KEY"] = m.group(1)
os.environ["MIND_BASE_URL"] = "https://api.z.ai/api/coding/paas/v4"
os.environ["MIND_KNOWLEDGE"] = os.path.abspath("public-mind/build/public-knowledge.sqlite")
os.environ["MIND_USAGE"] = os.path.abspath("public-mind/build/usage-live.sqlite")

import importlib
import mind_service
importlib.reload(mind_service)
mind_service.CFG["chat_enabled"] = True
assert not mind_service.MOCK, "mock mode stuck on — key not loaded"

QUESTIONS = [
    ("en", "How would Majid approach AI transformation in a large company?"),
    ("fa", "مجید تحول هوش مصنوعی را از کجا شروع می‌کند؟"),
    ("en", "What can you tell me about the Phoenix project?"),
]

for locale, q in QUESTIONS:
    t0 = time.time()
    msgs = [{"role": "system", "content": mind_service.SYSTEM_PROMPT},
            {"role": "user", "content": mind_service.build_prompt(
                q, locale, mind_service.retrieve(q, locale, 5), [])}]
    out = []
    full, usage = mind_service.call_glm_stream(msgs, lambda d: out.append(d))
    dt = time.time() - t0
    answer = mind_service.sanitize_output(full)
    print(f"\n=== [{locale}] {q}")
    print(f"latency={dt:.1f}s chars={len(answer)} usage={usage}")
    print(answer[:600])
    urls = mind_service.URL_IN_TEXT.findall(answer)
    bad = [u for u in urls if not mind_service.ALLOWED_URL_RE.match(u.rstrip('.,;:!?'))]
    print(f"urls: {len(urls)} (non-allowlisted after sanitize: {len(bad)})")

print("\nLIVE TEST DONE")
