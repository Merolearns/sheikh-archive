"""Resolve the content-mapping report's titles to catalog IDs and check every duration.

Reads the report's 40-day table and first-lesson picks, matches each exact title (whitespace
collapsed) against the v2 catalog, and writes v3/src/content.json. Fails loudly on any miss.
"""

import json
import pathlib
import re
import sys

HOME = pathlib.Path.home()
REPORT = HOME / "workspace/research_notes/islamic-archive-content-mapping-20261029-0017/report.md"
V2 = HOME / "workspace/archive-rebuild/build/Preview/archive.html"
OUT = pathlib.Path(__file__).resolve().parent.parent / "src/content.json"

h = V2.read_text(encoding="utf-8")
d, _ = json.JSONDecoder().raw_decode(h[h.find("{", h.find("const DATA =")) :])
ws = lambda s: re.sub(r"\s+", " ", s).strip()
by_title = {}
for v in d["videos"]:
    by_title.setdefault(ws(v["title"]), []).append(v)
pl_by_title = {ws(p["title"]): p for p in d["playlists"]}
fails = []


# The report's day 36 names this episode "الثالثة عشر"; the catalog title says "الرابعة عشر".
# Same series, same 11m40s, same topic (الحياء), so the catalog's lesson is used.
OVERRIDE = {
    "الحلقة الثالثة عشر من البرنامج الرمضاني وبشر المؤمنين بعنوان الحياء للدكتور مصطفى كامل": "qSM3-SMJS6E",
}
by_id = {v["id"]: v for v in d["videos"]}


def find(title, series_titles):
    if ws(title) in OVERRIDE:
        return by_id[OVERRIDE[ws(title)]]
    hits = by_title.get(ws(title), [])
    pls = [pl_by_title[ws(s)]["id"] for s in series_titles if ws(s) in pl_by_title]
    if not hits:  # the report sometimes completes a title the catalog truncates, or drops a closing ")"
        t = ws(title).replace(" ؟", "؟")
        hits = [v for v in d["videos"] if set(v["playlistIds"]) & set(pls)
                and (lambda c: t.startswith(c) or c.startswith(t))(ws(v["title"]).replace(" ؟", "؟"))]
    inside = [v for v in hits if set(v["playlistIds"]) & set(pls)]
    hits = inside or hits
    if len(hits) != 1:
        fails.append(f"{len(hits)} matches for {title!r} in {series_titles}")
        return None
    return hits[0]


def mmss(sec):
    return f"{sec // 60}m{sec % 60:02d}s"


text = REPORT.read_text(encoding="utf-8")
sec_c = text[text.index("### (c) Foundations in 40 days") : text.index("### (d)")]
days = []
for row in sec_c.splitlines():
    m = re.match(r"\| (\d+) \(was \d+\) \| ([^|]+) \| ([^|]+) \| (.+) \| (\d+)m(\d+)s \|$", row)
    if not m:
        continue
    day, phase, series, cell, tm, ts = m.groups()
    series_titles = [s.strip() for s in series.split(" + ")]
    parts = [p.strip() for p in cell.split(" + ")]
    ids, total = [], 0
    for part in parts:
        pm = re.search(r"\s\((\d+)m(\d+)s\)$", part)
        title = part[: pm.start()] if pm and len(parts) > 1 else part
        v = find(title, series_titles)
        if not v:
            continue
        if pm and len(parts) > 1 and mmss(v["duration"]) != f"{pm.group(1)}m{pm.group(2)}s":
            fails.append(f"day {day}: {title!r} is {mmss(v['duration'])}, report says {pm.group(0)}")
        ids.append(v["id"])
        total += v["duration"]
    if mmss(total) != f"{tm}m{ts}s":
        fails.append(f"day {day}: total {mmss(total)} vs report {tm}m{ts}s")
    if not 20 * 60 <= total <= 30 * 60:
        fails.append(f"day {day}: {mmss(total)} outside 20-30 min")
    days.append({"phase": phase.strip(), "ids": ids})
if len(days) != 40:
    fails.append(f"parsed {len(days)} days, expected 40")

FIRST = {  # brief, Build action F (exact titles)
    "beginner": ("الدرس الاول - تجويد - دكتور مصطفي كامل", "التجويد", "25m26s"),
    "intermediate": ("1- مقدمة في سورة مريم", "نظرات في سورة مريم", "23m20s"),
    "advanced": ("شرح البيقونيه - علم مصطلح الحديث (1)", "سلسله شرح البيقونيه - علم مصطلح الحديث", "16m20s"),
}
first = {}
for lvl, (title, series, want) in FIRST.items():
    v = find(title, [series])
    if v:
        if mmss(v["duration"]) != want:
            fails.append(f"first {lvl}: {mmss(v['duration'])} vs {want}")
        first[lvl] = {"id": v["id"], "pl": pl_by_title[ws(series)]["id"]}

sec_a = text[text.index("### (a) All 71 playlists") : text.index("### (b)")]
PILLAR = {"Quran": "quran", "Beliefs": "beliefs", "Worship": "worship", "Seerah": "seerah",
          "Character": "character", "Deeper sciences": "deeper", "NEEDS-OWNER-REVIEW": "occasions"}
pillars = {}
for row in sec_a.splitlines():
    m = re.match(r"\| (\d+) \| (.+?) \| (\d+) \| \d+h\d+m \| ([^|]+) \| ([^|]+) \|", row)
    if not m:
        continue
    title, pillar, level = m.group(2), m.group(4).strip(), m.group(5).strip()
    pl = pl_by_title.get(ws(title))
    if not pl:
        fails.append(f"playlist not found: {title!r}")
        continue
    pillars[pl["id"]] = [PILLAR[pillar], "" if pillar == "NEEDS-OWNER-REVIEW" else level]
if len(pillars) != 71 or sum(1 for x in pillars.values() if x[0] == "occasions") != 7:
    fails.append(f"pillar map: {len(pillars)} playlists")

if fails:
    sys.exit("RESOLVE FAILED:\n" + "\n".join(fails))
OUT.write_text(json.dumps({"days": days, "first": first, "pillars": pillars}, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"mapped {len(pillars)} playlists to pillars; resolved 40 days ({sum(len(x['ids']) for x in days)} lessons) + 3 first lessons, all durations match the report")
