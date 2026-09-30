import os

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static", "index.html")
with open(path, "r", encoding="utf-8") as f:
    for idx, line in enumerate(f, 1):
        if "switchperspective('recycler')" in line.lower().replace('"', "'"):
            print(f"Line {idx}")
