import sys, sqlite3
sys.path.insert(0, "public-mind/service")
import mind_service as m

q = "Why does AI adoption fail to produce ROI?"
print("fts queries:", m._fts_query(q))
for mq in m._fts_query(q):
    try:
        rows = m.KDB.execute(
            """SELECT r.id FROM records_fts f JOIN records r ON r.rowid=f.rowid
               WHERE records_fts MATCH ? AND language = ? LIMIT 5""",
            (mq, "en"),
        ).fetchall()
        print(f"  {mq!r} -> {len(rows)}")
    except sqlite3.OperationalError as e:
        print(f"  {mq!r} -> ERR {e}")
# try without the language filter
for mq in m._fts_query(q)[:1]:
    rows = m.KDB.execute(
        "SELECT r.id, r.language FROM records_fts f JOIN records r ON r.rowid=f.rowid WHERE records_fts MATCH ? LIMIT 3",
        (mq,),
    ).fetchall()
    print("no-lang-filter:", [(r["id"][:40], r["language"]) for r in rows])
