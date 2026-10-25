import sqlite3
db = sqlite3.connect("public-mind/build/public-knowledge.sqlite")
db.row_factory = sqlite3.Row
for q in ['"adoption"', '"adoption" "roi"', '"ai" "adoption"', '"adoption"* OR "roi"*',
          '"هوش" "مصنوعی"']:
    try:
        rows = db.execute(
            "SELECT r.id, r.title FROM records_fts f JOIN records r ON r.rowid=f.rowid WHERE records_fts MATCH ? LIMIT 3",
            (q,),
        ).fetchall()
        print(f"MATCH {q!r}: {len(rows)}", [r["id"][:40] for r in rows])
    except Exception as e:
        print(f"MATCH {q!r}: ERROR {e}")
print("total records:", db.execute("SELECT COUNT(*) FROM records").fetchone()[0])
print("fts rows:", db.execute("SELECT COUNT(*) FROM records_fts").fetchone()[0])
