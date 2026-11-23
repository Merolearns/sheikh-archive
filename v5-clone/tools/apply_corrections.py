#!/usr/bin/env python3
"""Apply human corrections to machine-translated video titles.

Reads audit/review-corrections.tsv (video id TAB corrected English, or the
word HOLD) and:
  - writes the corrected English into audit/video-en-mt.json (keyed by the
    video's Arabic title, so all copies of a repeated title are fixed), and
  - appends HOLD rows to audit/held-en.tsv (kind=video) so the merge script
    leaves titleEn empty for them.

Usage: python3 tools/apply_corrections.py
"""
import json
import re
from pathlib import Path

V5P = Path(__file__).resolve().parent.parent
REC = V5P / "audit" / "catalog-reconciled.js"
MT = V5P / "audit" / "video-en-mt.json"
CORR = V5P / "audit" / "review-corrections.tsv"
HELD = V5P / "audit" / "held-en.tsv"

AR = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")
AR_DIGITS = re.compile(r"[٠-٩]")


def main():
    if not CORR.exists():
        print("no corrections file; nothing to do")
        return
    data = json.loads(re.match(r"const DATA = (.*);\s*$", REC.read_text(encoding="utf-8"), re.S).group(1))
    title_of = {v["id"]: v["title"] for v in data["videos"]}
    mt = json.loads(MT.read_text(encoding="utf-8"))
    held_lines = []
    fixed, held = 0, 0
    for line in CORR.read_text(encoding="utf-8").splitlines():
        if not line or line.startswith("#"):
            continue
        vid, val = line.split("\t")
        assert vid in title_of, f"corrections: unknown video {vid!r}"
        if val.strip() == "HOLD":
            held_lines.append(f"video\t{vid}\tHeld on human review: {title_of[vid][:60]}")
            # Drop the machine draft for this title entirely: held-ness is
            # per title (all copies share the wording), and the merge refuses
            # a title that is both translated and held.
            mt.pop(title_of[vid], None)
            held += 1
            continue
        assert val.strip(), f"corrections: empty value for {vid}"
        bad = [ch for ch in val if AR.search(ch) and ch != "ﷺ"]
        assert not bad, f"corrections: Arabic left in {vid}: {val!r}"
        assert not AR_DIGITS.search(val), f"corrections: Arabic digits in {vid}"
        mt[title_of[vid]] = val
        fixed += 1
    MT.write_text(json.dumps(mt, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if held_lines:
        with open(HELD, "a", encoding="utf-8") as f:
            f.write("\n".join(held_lines) + "\n")
    print(f"corrections applied: fixed={fixed} held={held}")


if __name__ == "__main__":
    main()
