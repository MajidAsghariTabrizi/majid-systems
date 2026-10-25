"""Public HTTPS verification: real EN/FA prompts through the live gateway.
Evidence for the final report: SSE events, sources, tokens, latency."""
import json
import re
import sys
import time
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
URL = "https://quantiviq.xyz/api/public-mind/chat"
QUESTIONS = [
    ("en", "prod-en-final", "How would Majid lead AI Transformation in an FMCG group, and what verified work supports his approach?"),
    ("fa", "prod-fa-final", "اگر مجید مسئول تحول هوش مصنوعی یک هلدینگ FMCG باشد، در ۹۰ روز اول چه می‌کند و چه شواهدی از تجربه و رویکرد او وجود دارد؟"),
]
FA_RE = re.compile(r"[\u0600-\u06FF]")

for locale, session, q in QUESTIONS:
    req = urllib.request.Request(
        URL,
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
    u = done.get("usage", {})
    urls = re.findall(r"https?://[^\s<>\")\]]+", ans)
    allowed = [x for x in urls if re.match(r"^https?://(quantiviq\.xyz|github\.com/MajidAsghariTabrizi)", x)]
    fa_chars = len(FA_RE.findall(ans))
    lang_ok = (fa_chars > 50) if locale == "fa" else (fa_chars < 30)
    print(f"[{locale}] {dt:.1f}s status={done.get('status')} sources={len(src.get('sources', []))} chars={len(ans)}")
    print(f"  tokens={u.get('total_tokens')} (in={u.get('prompt_tokens')} out={u.get('completion_tokens')})")
    print(f"  lang_ok={lang_ok} urls={len(urls)} all_allowlisted={len(allowed) == len(urls)}")
    print(f"  source_types={sorted({s['type'] for s in src.get('sources', [])})}")
    print(f"  answer(350): {ans[:350]}")
    print()
print("PUBLIC HTTPS VERIFICATION DONE")
