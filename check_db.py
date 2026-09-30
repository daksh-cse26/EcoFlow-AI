import sqlite3

conn = sqlite3.connect("ecoflow.db")
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in c.fetchall()]

results = {}
for t in tables:
    try:
        c.execute(f"SELECT COUNT(*) FROM {t}")
        results[t] = c.fetchone()[0]
    except Exception as e:
        results[t] = str(e)

for t, cnt in results.items():
    print(f"{t}: {cnt}")
