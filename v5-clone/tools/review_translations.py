#!/usr/bin/env python3
"""Build the human-review file for machine-translated video titles.

Reads audit/video-en-mt.json + the catalog and writes audit/review-en.tsv
with one row per title that needs eyes on it:
  RULING   Arabic has ruling words (حكم/حرام/حلال/يجوز/كفر/بدعة/فتوى)
  QUESTION Arabic ends in ؟ / ? (often a fatwa-style question)
  MODAL_EN English uses a modal that changes a ruling (must/forbidden/
           permissible/disbelief/innovation) — catches modal drift
  VERSE    Arabic quotes scripture without a قال الله marker
  SAMPLE   random 10% of everything else (seed fixed, reproducible)

The reviewer reads the TSV, fixes bad English in place in
audit/review-corrections.tsv (video id TAB corrected English, or the word
HOLD to hold the title), then runs tools/apply_corrections.py.
"""
import json
import random
import re
from pathlib import Path

V5P = Path(__file__).resolve().parent.parent
REC = V5P / "audit" / "catalog-reconciled.js"
MT = V5P / "audit" / "video-en-mt.json"
OUT = V5P / "audit" / "review-en.tsv"

RULING = re.compile(r"حكم|حرام|حلال|يجوز|كفر|بدع|فتو")
MODAL_EN = re.compile(r"\bmust\b|\bforbidden\b|\bpermissible\b|\bdisbelief\b|\binnovation\b|\bshould\b|\bmay not\b", re.I)
VERSE = re.compile(r"قال الله|قول الله|قال تعالى|﴿|{")
Q = re.compile(r"[؟?]")


def main():
    data = json.loads(re.match(r"const DATA = (.*);\s*$", REC.read_text(encoding="utf-8"), re.S).group(1))
    mt = json.loads(MT.read_text(encoding="utf-8"))
    by_title = {}
    for v in data["videos"]:
        by_title.setdefault(v["title"], v["id"])
    rows = []
    rest = []
    for ar, en in sorted(mt.items()):
        tags = []
        if RULING.search(ar):
            tags.append("RULING")
        if Q.search(ar):
            tags.append("QUESTION")
        if MODAL_EN.search(en):
            tags.append("MODAL_EN")
        if VERSE.search(ar):
            tags.append("VERSE")
        vid = by_title[ar]
        if tags:
            rows.append((vid, ",".join(tags), ar, en))
        else:
            rest.append((vid, ar, en))
    rng = random.Random(20261122)
    sample = rng.sample(rest, max(1, len(rest) // 10))
    for vid, ar, en in sorted(sample):
        rows.append((vid, "SAMPLE", ar, en))
    rows.sort(key=lambda r: (r[1], r[0]))
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("# video-id\tset\tArabic\tEnglish (MT)\n")
        for vid, tags, ar, en in rows:
            f.write(f"{vid}\t{tags}\t{ar}\t{en}\n")
    from collections import Counter
    print(f"review rows: {len(rows)}  sets: {dict(Counter(r[1] for r in rows))}")


if __name__ == "__main__":
    main()
