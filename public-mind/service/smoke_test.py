"""Mock-mode SSE chat smoke test against the local service."""
import json
import sys
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

def chat(payload):
    req = urllib.request.Request(
        "http://127.0.0.1:8210/chat",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    events = []
    with urllib.request.urlopen(req, timeout=30) as r:
        ev, buf = None, []
        for raw in r:
            line = raw.decode("utf-8").rstrip("\n")
            if line.startswith("event: "):
                ev = line[7:]
            elif line.startswith("data: ") and ev:
                events.append((ev, json.loads(line[6:])))
    return events

# 1. English question
ev = chat({
    "session": "smoke-en-1",
    "locale": "en",
    "messages": [{"role": "user", "content": "Why does AI adoption fail to produce ROI?"}],
})
types = [e for e, _ in ev]
src = next(d for e, d in ev if e == "sources")
deltas = "".join(d["text"] for e, d in ev if e == "delta")
done = next(d for e, d in ev if e == "done")
print("EN events:", types[:3], "...", types[-1])
print("EN sources:", len(src["sources"]), "first:", src["sources"][0]["title"][:60], "|", src["sources"][0]["url"])
print("EN mock answer (first 160):", deltas[:160].replace("\n", " "))
print("EN done:", done)
print()

# 2. Persian question
ev2 = chat({
    "session": "smoke-fa-1",
    "locale": "fa",
    "messages": [{"role": "user", "content": "تحول هوش مصنوعی از کجا شروع می‌شود؟"}],
})
src2 = next(d for e, d in ev2 if e == "sources")
deltas2 = "".join(d["text"] for e, d in ev2 if e == "delta")
print("FA sources:", len(src2["sources"]), "langs:", {s["language"] for s in src2["sources"]})
print("FA mock answer (first 120):", deltas2[:120].replace("\n", " "))
print()

# 3. rate limit: session smoke-en-1 already used 1 of 6
for i in range(6):
    try:
        r = chat({"session": "smoke-en-1", "locale": "en",
                  "messages": [{"role": "user", "content": f"limit probe {i}"}]})
        last = r[-1][1].get("status")
    except urllib.error.HTTPError as e:
        print("RATE LIMIT HIT at question", i + 2, "->", e.code, json.loads(e.read()).get("error"))
        break
print()

# 4. language auto-detect without locale
ev4 = chat({"session": "smoke-fa-2", "messages": [{"role": "user", "content": "چه کتاب‌هایی منتشر شده؟"}]})
src4 = next(d for e, d in ev4 if e == "sources")
print("auto-detect locale:", src4["locale"])
print("SMOKE OK")
