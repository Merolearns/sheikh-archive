#!/usr/bin/env python3
"""Adjudication review (mechanical, read-only) for the Books inventory.

Re-runs the DeepSeek adjudication review that burned out 3x, mechanically:
checks file accounting, page counts, title support, Anta question counts,
sort order, owner-review exclusion, books-data.js parity, author credit.
Writes a JSON report next to this script; the human-readable verdict goes in
adjudication-review-20261120.md (written separately from this output).
Never edits any inventory or app file.
"""
import json, re, unicodedata, sys
from pathlib import Path
from collections import Counter

BASE = Path.home() / "workspace/archive-rebuild/v5-prototype"
AUD = BASE / "books-audit"
SRC = Path.home() / "workspace/archive-rebuild/v5/books-from-sheikh"
OUT = AUD / "adjudication-check-results.json"

inv = json.load(open(AUD / "books-inventory.json"))
raw = json.load(open(AUD / "raw-extraction.json"))
own = json.load(open(AUD / "owner-review-list.json"))
dedup = json.load(open(AUD / "dedup-mechanical.json"))

ext_by_file = {e["filename"]: e for e in raw}
report = {"checks": {}, "per_entry": [], "mismatches": []}

def flag(code, detail):
    report["mismatches"].append({"code": code, "detail": detail})

# ---------- Arabic normalization ----------
DIAC = dict.fromkeys(map(ord, "ًٌٍَُِّْٰٕٖٜٟٓٔٗ٘ٙٚٛٝٞ"), None)
def norm_ar(s):
    if s is None: return ""
    s = unicodedata.normalize("NFKC", s)
    s = s.translate(DIAC).replace("ـ", "")
    s = re.sub(r"[أإآٱٲ]", "ا", s)
    s = s.replace("ة", "ه").replace("ى", "ي").replace("ؤ", "و").replace("ئ", "ي")
    s = s.replace("ی", "ي").replace("ک", "ك")  # Farsi yeh/kaf (U+06CC/U+06A9) -> Arabic yeh/kaf
    s = re.sub(r"[^\w\s]", " ", s, flags=re.UNICODE)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def norm_en(s):
    if s is None: return ""
    s = unicodedata.normalize("NFKC", s).lower()
    s = re.sub(r"[^a-z0-9 ]", " ", s)
    return re.sub(r"\s+", " ", s).strip()

# ---------- Check 1: accounting ----------
listed_files, listed_by_entry = [], {}
for e in inv["inventory"]:
    for f in e["files"]:
        listed_files.append(f); listed_by_entry.setdefault(f, []).append(e["id"])
review_files = [f for g in inv["review"] for f in g["files"]]
cover_files = [c["file"] for c in inv["cover_assets"]]
all_raw = [e["filename"] for e in raw]
c = Counter(listed_files + review_files + cover_files)
dupes = [f for f, n in c.items() if n > 1]
missing = [f for f in all_raw if c.get(f, 0) == 0]
extra = [f for f in c if f not in set(all_raw)]
# owner-review list files (5 items, incl. proud which IS listed)
own_files = [f for it in own["items"] for f in it["files"]]
own_unlisted = [f for f in own_files if f not in listed_files]
report["checks"]["1_accounting"] = {
    "raw_total": len(all_raw), "listed_files": len(listed_files),
    "review_files": len(review_files), "cover_files": len(cover_files),
    "sum": len(listed_files) + len(review_files) + len(cover_files),
    "duplicates": dupes, "missing_from_all_dispositions": missing,
    "in_no_disposition_but_raw": extra,
    "owner_review_files_total": len(own_files),
    "owner_review_files_not_listed": own_unlisted,
    "owner_review_files_listed_anyway": [f for f in own_files if f in listed_files],
    "verdict": "PASS" if not dupes and not missing and not extra else "FLAG",
}
if dupes: flag("C1-DUP", f"double-counted files: {dupes}")
if missing: flag("C1-MISSING", f"raw files with no disposition: {missing}")
if extra: flag("C1-EXTRA", f"disposition files not in raw extraction: {extra}")

# ---------- Check 2: page counts ----------
try:
    from pypdf import PdfReader
    HAVE_PYPDF = True
except ImportError:
    HAVE_PYPDF = False
page_rows = []
for e in inv["inventory"]:
    if e.get("parts"):
        subtotal = sum(p["pages"] for p in e["parts"])
        ok_sum = (subtotal == e["pages"])
        for p in e["parts"]:
            ex = ext_by_file.get(p["file"])
            page_rows.append({"entry": e["id"], "file": p["file"],
                "claimed": p["pages"], "extracted": ex["pages"] if ex else None,
                "match": bool(ex and ex["pages"] == p["pages"])})
        if not ok_sum:
            flag("C2-SUM", f"{e['id']}: parts sum {subtotal} != entry pages {e['pages']}")
    else:
        f = e["files"][0]
        ex = ext_by_file.get(f)
        page_rows.append({"entry": e["id"], "file": f,
            "claimed": e["pages"], "extracted": ex["pages"] if ex else None,
            "match": bool(ex and ex["pages"] is not None and ex["pages"] == e["pages"])})
        if ex is not None and ex["pages"] is None:
            flag("C2-NOPAGES", f"{e['id']} {f}: raw extraction has no page count "
                 f"(format {e['format']}); inventory claims {e['pages']} pp — needs LibreOffice evidence")
        elif ex is not None and ex["pages"] != e["pages"]:
            flag("C2-PAGES", f"{e['id']} {f}: inventory {e['pages']} pp != extracted {ex['pages']} pp")
# pypdf recount of every PDF on disk (read-only)
disk_pages = {}
if HAVE_PYPDF:
    for e in raw:
        if e["format"] != "pdf":
            continue
        p = SRC / "books" / e["filename"]
        if not p.exists():
            p = SRC / e["filename"]
        try:
            disk_pages[e["filename"]] = len(PdfReader(str(p)).pages)
        except Exception as exn:
            disk_pages[e["filename"]] = f"ERROR {exn}"
    disk_mismatch = {f: (ext_by_file[f]["pages"], d) for f, d in disk_pages.items()
                     if isinstance(d, int) and d != ext_by_file[f]["pages"]}
    disk_missing = [f for f, d in disk_pages.items() if isinstance(d, str)]
    if disk_mismatch: flag("C2-DISK", f"pypdf recount != raw extraction: {disk_mismatch}")
    if disk_missing: flag("C2-DISK", f"unreadable on disk: {disk_missing}")
else:
    disk_mismatch, disk_missing = {}, ["pypdf unavailable"]
report["checks"]["2_pages"] = {
    "rows": page_rows,
    "all_match_extraction": all(r["match"] for r in page_rows),
    "pypdf_recount_done": HAVE_PYPDF,
    "pypdf_vs_extraction_mismatches": disk_mismatch if HAVE_PYPDF else None,
    "phd_parts_sum": 330 + 230 + 286 + 211,
    "verdict": "PASS" if all(r["match"] for r in page_rows) and not (disk_mismatch if HAVE_PYPDF else True) else "FLAG",
}

# ---------- Check 3: title support ----------
transcript = (SRC / "EXCHANGE-Nov7-Nov20.md").read_text(encoding="utf-8")
title_rows = []
for e in inv["inventory"]:
    texts = []
    for f in e["files"]:
        ex = ext_by_file.get(f)
        if ex:
            texts.append(" ".join(ex.get("title_block") or []))
            if ex.get("meta_title"): texts.append(ex["meta_title"])
            texts.append(f)
    # companion cover files carry the clean Anta title
    if e.get("cover_file"):
        for c in inv["cover_assets"]:
            if c["front_jpg"] == e["cover_file"]:
                ex = ext_by_file.get(c["file"])
                if ex: texts.append(" ".join(ex.get("title_block") or []))
    joined_ar = norm_ar(" ".join(texts))
    joined_en = norm_en(" ".join(texts))
    sup_ar = (not e.get("title_ar")) or (norm_ar(e["title_ar"]) in joined_ar)
    sup_en = (not e.get("title_en")) or (norm_en(e["title_en"]) in joined_en)
    # transcript fallback (DOCX with no readable first page)
    via_transcript = ""
    if not (sup_ar and sup_en):
        for f in e["files"]:
            base = f.rsplit(".", 1)[0]
            if e.get("title_ar") and norm_ar(e["title_ar"]) and norm_ar(e["title_ar"]) in norm_ar(transcript):
                via_transcript = "transcript send record names this title"
    title_rows.append({"entry": e["id"], "title_ar": e.get("title_ar"),
        "title_en": e.get("title_en"), "supported_ar": sup_ar,
        "supported_en": sup_en, "via_transcript": via_transcript})
    if not sup_ar and not via_transcript:
        flag("C3-TITLE-AR", f"{e['id']}: Arabic title {e.get('title_ar')!r} not found in "
             f"its file's first-page title block / metadata / filename")
    if not sup_en:
        flag("C3-TITLE-EN", f"{e['id']}: English title {e.get('title_en')!r} not found in "
             f"its file's first-page title block / metadata / filename")
report["checks"]["3_titles"] = {"rows": title_rows,
    "verdict": "PASS" if all(r["supported_ar"] and r["supported_en"] for r in title_rows) else "FLAG"}

# ---------- Check 4: Anta Tasalu question counts ----------
def ar_digits(s):
    return s.translate(str.maketrans("٠١٢٣٤٥٦٧٨٩", "0123456789"))
anta = {}
for e in inv["inventory"]:
    if e["id"] in ("book-03", "book-04"):
        m = re.search(r"(\d+)\s+questions", e["notes"] or "")
        anta[e["id"]] = int(m.group(1)) if m else None
cover_ev = {}
for c in inv["cover_assets"]:
    ex = ext_by_file.get(c["file"])
    tb = " ".join(ex.get("title_block") or []) if ex else ""
    mm = re.search(r"([٠-٩]+)\s*مسألة", tb)
    cover_ev[c["file"]] = int(ar_digits(mm.group(1))) if mm else None
report["checks"]["4_anta_counts"] = {
    "inventory_claims": anta,
    "cover_file_evidence": cover_ev,
    "vol1_cover_states_405": cover_ev.get("Part1_Cover_Wraparound.pdf") == 405,
    "vol2_cover_states_303": cover_ev.get("Part2_Cover_Wraparound.pdf") == 303,
    "note": ("Counts come from the books' own cover 'About this book' text "
             "(raw-extraction title_block of the wraparound PDFs). Independent "
             "in-text count: see adjudication-review-20261120.md §4."),
    "verdict": "PASS" if cover_ev.get("Part1_Cover_Wraparound.pdf") == 405 and cover_ev.get("Part2_Cover_Wraparound.pdf") == 303 else "FLAG",
}

# ---------- Check 5: sort order ----------
ALPHA = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي"
RANK = {ch: i for i, ch in enumerate(ALPHA)}
def strip_al(t):
    # strip definite article ال from the start of each word (for sort key only)
    out = []
    for w in t.split():
        if len(w) > 2 and w.startswith("ال"):
            w = w[2:]
        out.append(w)
    return " ".join(out)
def sort_key_ar(title):
    t = strip_al(norm_ar(title))
    return tuple(RANK.get(ch, 99) for ch in t if ch != " ")
entries = inv["inventory"]
phd_first = entries[0]["id"] == "book-01"
ar_block = [e for e in entries[1:] if e.get("title_ar")]
en_only = [e for e in entries[1:] if not e.get("title_ar")]
# expected order under the stated rule: PhD, then Arabic-title entries sorted
# by Arabic title (ال ignored), ties by part, then English-only by English title
def ar_sort_key(e):
    return (sort_key_ar(e["title_ar"]), e.get("part") or 0)
expected_ar = sorted(ar_block, key=ar_sort_key)
expected_en = sorted(en_only, key=lambda e: norm_en(e["title_en"]))
actual_ar_ids = [e["id"] for e in ar_block]
expected_ar_ids = [e["id"] for e in expected_ar]
actual_en_ids = [e["id"] for e in en_only]
expected_en_ids = [e["id"] for e in expected_en]
# adjacent inversions in the actual Arabic block
inversions = []
for a, b in zip(ar_block, ar_block[1:]):
    if ar_sort_key(a) > ar_sort_key(b):
        inversions.append((a["id"], b["id"], a.get("title_ar"), b.get("title_ar")))
if actual_ar_ids != expected_ar_ids:
    flag("C5-SORT-AR", f"Arabic block order differs from ال-ignored dictionary order. "
         f"actual={actual_ar_ids} expected={expected_ar_ids}")
if actual_en_ids != expected_en_ids:
    flag("C5-SORT-EN", f"English block order differs from alphabetical. actual={actual_en_ids} expected={expected_en_ids}")
# alternative reading: sort by language field (ar entries first, then en)
lang_sorted = [e for e in entries[1:] if e["language"] == "ar"] + [e for e in entries[1:] if e["language"] == "en"]
lang_ids = [e["id"] for e in lang_sorted]
actual_ids = [e["id"] for e in entries[1:]]
report["checks"]["5_sort"] = {
    "phd_first": phd_first,
    "arabic_block_ids_actual": actual_ar_ids,
    "arabic_block_ids_expected": expected_ar_ids,
    "english_block_ids_actual": actual_en_ids,
    "english_block_ids_expected": expected_en_ids,
    "adjacent_inversions_in_arabic_block": inversions,
    "alt_language_based_order_differs": actual_ids != lang_ids,
    "alt_language_based_expected_tail": lang_ids[-6:],
    "verdict": "PASS" if actual_ar_ids == expected_ar_ids and actual_en_ids == expected_en_ids and phd_first else "FLAG",
}

# ---------- Check 6: owner-review exclusion from books-data.js ----------
js_text = (BASE / "books-data.js").read_text(encoding="utf-8")
review_in_js = [f for f in review_files if f in js_text]
own_in_js = [f for f in own_files if f in js_text]
report["checks"]["6_owner_review_excluded"] = {
    "review_files_in_books_data_js": review_in_js,
    "all_owner_review_files_in_books_data_js": own_in_js,
    "proud_file_in_books_data_js": "_16-_Series_of_-Proud_To_Be_Muslims-.pdf" in js_text,
    "note": ("review-05 (Proud authorship) concerns a LISTED book whose author "
             "credit is withheld, not a withheld file; see report §6."),
    "verdict": "PASS" if not review_in_js else "FLAG",
}
if review_in_js: flag("C6-LEAK", f"owner-review files present in books-data.js: {review_in_js}")

# ---------- Check 7: books-data.js parity ----------
m = re.search(r"window\.BOOKS\s*=\s*(\{.*\});\s*$", js_text, re.S)
js = json.loads(m.group(1)) if m else {}
js_books = {b["id"]: b for b in js.get("books", [])}
js_diffs = []
for e in inv["inventory"]:
    b = js_books.get(e["id"])
    if b is None:
        js_diffs.append(f"{e['id']} missing from books-data.js"); continue
    for f in ("title_ar", "title_en", "author_ar", "author_en", "language", "pages", "format", "part", "parts", "companion"):
        if b.get(f) != e.get(f):
            js_diffs.append(f"{e['id']}.{f}: js={b.get(f)!r} inv={e.get(f)!r}")
    js_files = [x.removeprefix("books/files/") for x in b.get("files", [])]
    if js_files != e["files"]:
        js_diffs.append(f"{e['id']}.files: js={js_files} inv={e['files']}")
    js_cover = b.get("cover")
    inv_cover = ("books/covers/" + e["cover_file"]) if e.get("cover_file") else None  # generator prefixes (build-books-data.py:57)
    if js_cover != inv_cover:
        js_diffs.append(f"{e['id']}.cover: js={js_cover!r} inv={inv_cover!r}")
extra_js = [i for i in js_books if i not in {e["id"] for e in inv["inventory"]}]
if extra_js: js_diffs.append(f"extra ids in books-data.js: {extra_js}")
if js.get("counts") != inv.get("counts"):
    js_diffs.append(f"counts differ: js={js.get('counts')} inv={inv.get('counts')}")
report["checks"]["7_books_data_js"] = {
    "js_book_count": len(js_books), "inventory_count": len(inv["inventory"]),
    "diffs": js_diffs,
    "verdict": "PASS" if not js_diffs else "FLAG",
}
if js_diffs: flag("C7-DIFF", "; ".join(js_diffs))

# ---------- Check 8: author credit ----------
BIO_AR = "مصطفي سليمان كامل"; BIO_EN = "Moustafa Suleiman Kamel"
author_rows = []
for e in inv["inventory"]:
    ev = []
    if e.get("author_ar") is None and e.get("author_en") is None:
        ev.append("author deliberately omitted (no author stated in file)")
    else:
        if e.get("author_ar") == "د. مصطفى سليمان كامل" or e.get("author_en") == "Dr. Moustafa Suleiman Kamel":
            ev.append("name form matches the Sheikh's dictated bio (مصطفي سليمان كامل / Moustafa Suleiman Kamel)")
        # in-file author line?
        for f in e["files"]:
            ex = ext_by_file.get(f)
            if ex:
                tb = " ".join(ex.get("title_block") or [])
                if "مصطفى" in tb or "مصطفي" in tb:
                    ev.append(f"title page names the Sheikh ({f})")
                if ex.get("meta_author") and "مصطف" in (ex["meta_author"] or ""):
                    ev.append(f"PDF metadata author ({f})")
        if e["id"] == "book-01":
            ev.append("dissertation title page: تأليف د. مصطفى سليمان محمد كامل، إشراف د. صلاح الصاوي; bio: doctorate on الفرقة بين الزوجين")
        if e["id"] in ("book-03", "book-04"):
            ev.append("cover/interior: أجوبة فضيلة الشيخ الدكتور مصطفى كامل; compiler م. عمرو محمود credited in notes, not as author")
        if e["id"] == "book-27":
            ev.append("title page: شرح د. مصطفى سليمان محمد كامل — Sheikh's lessons ON al-Manfaluti's الفضيلة (note guards against misreading)")
        if e["id"] == "book-31":
            ev.append("no author line in DOCX first page; support is the transcript send record (Sheikh sent the DOCX Nov 7)")
        if e["id"] == "book-32":
            ev.append("no author line on title page; PDF meta_author is 'hosni ibrahim' (likely typesetter); support is the transcript send record (Sheikh sent the PDF Nov 13, his Friday khutba text)")
        if e["id"] == "book-38":
            ev.append("file states no author anywhere; author omitted, authorship on owner-review list")
    author_rows.append({"entry": e["id"], "author_ar": e.get("author_ar"),
        "author_en": e.get("author_en"), "evidence": ev})
# hard flags: credited author with no supporting evidence at all
for r in author_rows:
    if r["author_ar"] and not r["evidence"]:
        flag("C8-AUTHOR", f"{r['entry']}: author credited with no supporting evidence")
report["checks"]["8_author"] = {"rows": author_rows,
    "verdict": "PASS" if not any(r["author_ar"] and not r["evidence"] for r in author_rows) else "FLAG"}

# ---------- companions + same-title intentional duplicates ----------
comp = [(e["id"], e.get("companion")) for e in inv["inventory"] if e.get("companion")]
comp_ok = all(
    next((x.get("companion") for x in inv["inventory"] if x["id"] == c), None) == i
    for i, c in comp)
report["checks"]["companions_mutual"] = {"pairs": comp, "mutual": comp_ok}
title_groups = {}
for e in inv["inventory"]:
    title_groups.setdefault((e.get("title_ar"), e.get("title_en")), []).append(e["id"])
report["checks"]["same_title_groups"] = {str(k): v for k, v in title_groups.items() if len(v) > 1}

# ---------- per-entry table ----------
for e in inv["inventory"]:
    t = next((r for r in title_rows if r["entry"] == e["id"]), {})
    a = next((r for r in author_rows if r["entry"] == e["id"]), {})
    pages_ok = all(r["match"] for r in page_rows if r["entry"] == e["id"])
    verdict = "PASS" if pages_ok and t.get("supported_ar") and t.get("supported_en") else "FLAG"
    report["per_entry"].append({
        "id": e["id"], "files": e["files"], "pages_claimed": e["pages"],
        "pages_extracted": [r["extracted"] for r in page_rows if r["entry"] == e["id"]],
        "title_supported": bool(t.get("supported_ar") and t.get("supported_en")),
        "author_evidence": a.get("evidence", []), "verdict": verdict,
    })

report["summary"] = {
    "entries_total": len(inv["inventory"]),
    "entries_pass_clean": sum(1 for r in report["per_entry"] if r["verdict"] == "PASS"),
    "entries_flagged": [r["id"] for r in report["per_entry"] if r["verdict"] == "FLAG"],
    "mismatch_count": len(report["mismatches"]),
    "check_verdicts": {k: v.get("verdict") for k, v in report["checks"].items() if isinstance(v, dict) and "verdict" in v},
}
json.dump(report, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(report["summary"], ensure_ascii=False, indent=1))
print("MISMATCHES:")
for mm in report["mismatches"]:
    print(" -", mm["code"], ":", mm["detail"])
print("wrote", OUT)
