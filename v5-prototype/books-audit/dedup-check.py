#!/usr/bin/env python3
"""Track 3 prototype: MECHANICAL dedup check (deterministic, no LLM).

Applies BRIEF_V5 dedup rule (a): normalized Arabic title match, case-folded
English title, file-name match. Compares every book-candidate file against
every other on:
  1. filename-derived title, normalized
  2. first-page title-block lines, normalized
  3. normalized file name (ignoring extension and -/_/space separators)
Writes books-audit/dedup-mechanical.json. This is the mechanical cross-check
for the DeepSeek adjudication; where they disagree, the disagreement itself
goes to the owner-review list.
"""
import json, re, unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
M = json.load(open(HERE / "raw-extraction.json", encoding="utf-8"))

TASHKEEL = re.compile(r"[\u064b-\u0652\u0670\u0640]")
PUNCT = re.compile(r"[^\w\s]", re.UNICODE)

def normalize_ar(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s)
    s = TASHKEEL.sub("", s)
    s = s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").replace("ٱ", "ا")
    s = s.replace("ؤ", "و").replace("ئ", "ي").replace("ء", "")
    s = s.replace("ة", "ه").replace("ى", "ي")
    s = PUNCT.sub(" ", s)
    return " ".join(s.split())

def filename_title(fn):
    base = re.sub(r"\.(pdf|docx)$", "", fn, flags=re.I)
    base = base.replace("_", " ").replace("-", " ")
    base = re.sub(r"\bملون\b", "", base)
    base = re.sub(r"\s+\d+\s*$", "", base)  # trailing -2/-3 version suffix
    base = re.sub(r"^\d+\s+", "", base)
    return " ".join(base.split())

def file_key(fn):
    base = re.sub(r"\.(pdf|docx)$", "", fn, flags=re.I)
    return re.sub(r"[^a-z0-9\u0600-\u06ff]", "", normalize_ar(base).lower())

groups = {}
for r in M:
    ft = filename_title(r["filename"])
    keys = {
        "filename_title": normalize_ar(ft) if re.search(r"[\u0600-\u06ff]", ft) else ft.lower(),
        "file_key": file_key(r["filename"]),
    }
    # title-block lines (skip basmala-only lines)
    for line in (r.get("title_block") or []):
        n = normalize_ar(line)
        if n and len(n) > 4 and "بسم الله الرحمن الرحيم" not in n and n != "بسم الله الرحمن الرحيم":
            keys.setdefault("block_titles", []).append(n)
    r["_keys"] = keys

# group by normalized filename-title
by_title = {}
for r in M:
    k = r["_keys"]["filename_title"]
    if k:
        by_title.setdefault(k, []).append(r["filename"])
# group by normalized file key (ignoring -2/-3 suffixes already stripped in filename_title,
# but file_key keeps digits — use title key as primary; file_key as secondary)
by_block = {}
for r in M:
    for t in r["_keys"].get("block_titles", []):
        by_block.setdefault(t, []).append(r["filename"])

out = {
    "by_filename_title": {k: v for k, v in by_title.items() if len(v) > 1},
    "by_first_page_title": {k: v for k, v in by_block.items() if len(v) > 1},
}
with open(HERE / "dedup-mechanical.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print(json.dumps(out, ensure_ascii=False, indent=1))
print("\nfiles:", len(M))
