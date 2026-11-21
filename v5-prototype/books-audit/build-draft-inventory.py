#!/usr/bin/env python3
"""Track 3 prototype: build the DRAFT Books inventory mechanically.

Deterministic derivation from raw-extraction.json + the WhatsApp transcript
(EXCHANGE-Nov7-Nov20.md) + MANIFEST.json (SHA-256, byte sizes).
Titles from each file's own first-page title block (standard-script Arabic,
verified against the transcript's send records). Authors only from verified
facts (bio source + dissertation title page + the Sheikh's Nov 16 message).
Pages verified (pypdf / app.xml / LibreOffice render). Nothing invented:
anything not established goes to the review list. DeepSeek reviews this
draft next; disagreements go to the review list, not the public list.
"""
import json, re, unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
M = {r["filename"]: r for r in json.load(open(HERE / "raw-extraction.json", encoding="utf-8"))}

TASHKEEL = re.compile(r"[\u064b-\u0652\u0670\u0640]")

def disp(s):
    """Display Arabic: NFKC to standard script, strip tashkeel, tidy spaces."""
    if not s:
        return None
    s = unicodedata.normalize("NFKC", s)
    s = TASHKEEL.sub("", s)
    return " ".join(s.split()) or None

SHEIKH_AR = "د. مصطفى سليمان كامل"
SHEIKH_EN = "Dr. Moustafa Suleiman Kamel"

# filename -> (title_ar, title_en, author_ar, author_en, language, part, note)
# Titles transcribed from each file's own title block (checked above).
D = {
    # Anta Tasalu — cover text verified by eye; interior title block is ligature-garbled
    "Part1_Interior_256pp.pdf": ("أنت تسأل والشيخ يجيب", "Anta Tasalu wa al-Shaikhu Yujib", SHEIKH_AR, SHEIKH_EN, "ar", 1, "Vol 1; 405 questions, 15 chapters; compiled by Amr Mahmoud (cover credit جمع وإعداد: م. عمرو محمود); cover Part1_Cover_Wraparound.pdf"),
    "Part2_Interior_204pp.pdf": ("أنت تسأل والشيخ يجيب", "Anta Tasalu wa al-Shaikhu Yujib", SHEIKH_AR, SHEIKH_EN, "ar", 2, "Vol 2; 303 questions, 15 chapters; compiled by Amr Mahmoud; cover Part2_Cover_Wraparound.pdf"),
    # PhD book — four parts, one entry (design verdict D15)
    "______-___-_______-____________-____.pdf": ("الفرقة بين الزوجين", None, SHEIKH_AR, SHEIKH_EN, "ar", 1, "PhD book, part 1 of 4 (330 pp)"),
    "______-___-_______-____________-____-2.pdf": ("الفرقة بين الزوجين", None, SHEIKH_AR, SHEIKH_EN, "ar", 2, "PhD book, part 2 of 4 (230 pp)"),
    "______-___-_______-____________-____-3.pdf": ("الفرقة بين الزوجين", None, SHEIKH_AR, SHEIKH_EN, "ar", 3, "PhD book, part 3 of 4 (286 pp)"),
    "______-___-_______-____________-____-4.pdf": ("الفرقة بين الزوجين", None, SHEIKH_AR, SHEIKH_EN, "ar", 4, "PhD book, part 4 of 4 (211 pp)"),
    # DOCX — identified by MANIFEST byte size (46-underscore file = 1,768,577 B PhD manuscript; 31-underscore = 137,565 B)
    "______________________________________________.docx": ("الفرقة بين الزوجين", None, "مصطفى سليمان محمد كامل", "Moustafa Suleiman Mohamed Kamel", "ar", None, "PhD dissertation source manuscript (DOCX), 819 pp, supervisor Dr. Salah al-Sawi; SAME WORK as the 4-part PhD book — review, do not list separately"),
    "_______________________________.docx": ("مسائل في مشكلات الحياة الزوجية", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Distinct work; 32 pp verified by LibreOffice render; sent by the Sheikh Nov 7"),
    # Marriage / family
    "___-______-______-____-2.pdf": ("فقه الزواج الميسر", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Subtitle printed: نحو أسرة مسلمة سعيدة"),
    "-_____.pdf": ("الخيانة الزوجية وسبل التعامل معها", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "16 pp, sent Nov 7 — version A of the infidelity work"),
    "_______-_______-____-_______-____-____.pdf": ("الخيانة الزوجية وسبل التعامل معها", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "17 pp, sent Nov 17 — version B of the infidelity work"),
    # Fatiha — parallel AR + EN editions
    "_______-__-____-_______-_____-______-____.pdf": ("إضاءات من سورة الفاتحة", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Subtitle: خواطر العشاء; companion: English edition"),
    "illuminations-from-surah-al-fatiha-dinner-reflections.pdf": ("إضاءات من سورة الفاتحة", "Illuminations from Surah al-Fatiha (Dinner Reflections)", SHEIKH_AR, SHEIKH_EN, "en", None, "English companion of the Arabic Fatiha book"),
    # Kahf — three successive versions, same printed title
    "kahf-khutbas-____-3.pdf": ("إضاءات من سورة الكهف", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "126 pp, sent Nov 16 — version A; printed title إضاءات من سورة الكهف — الجزء الأول"),
    "kahf-khutbas-____-2.pdf": ("إضاءات من سورة الكهف", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "135 pp, sent Nov 18 — version B"),
    "kahf-khutbas-____.pdf": ("إضاءات من سورة الكهف", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "138 pp, sent Nov 19 — version C"),
    # Seerah — transcript confirms: 92 pp = الجزء الأول (Nov 18 6:30 PM), 55 pp = الجزء الثاني (6:31 PM)
    "_____-__-______-_______-_____-______-____.pdf": ("وقفات من السيرة النبوية", None, SHEIKH_AR, SHEIKH_EN, "ar", 1, "Part 1 of 2 (Arabic), 92 pp"),
    "_____-__-______-_______-_____-______-____-2.pdf": ("وقفات من السيرة النبوية", None, SHEIKH_AR, SHEIKH_EN, "ar", 2, "Part 2 of 2 (Arabic), 55 pp"),
    "educational-reflections-on-the-seerah-part-one.pdf": ("وقفات من السيرة النبوية", "Educational Reflections on the Seerah", SHEIKH_AR, SHEIKH_EN, "en", 1, "Part 1 of 2 (English); Arabic title from the parallel Arabic edition"),
    "educational-reflections-on-the-seerah-part-two.pdf": ("وقفات من السيرة النبوية", "Educational Reflections on the Seerah", SHEIKH_AR, SHEIKH_EN, "en", 2, "Part 2 of 2 (English)"),
    # Stories / lessons
    "moses-story-book-____.pdf": ("قصة موسى عليه السلام", None, SHEIKH_AR, SHEIKH_EN, "ar", None, None),
    "prophets-stories-complete-book-____.pdf": ("قصص الأنبياء", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Subtitle printed: الكتاب الكامل"),
    "usul-al-fiqh-lessons-____.pdf": ("دروس أصول الفقه للمبتدئين", None, SHEIKH_AR, SHEIKH_EN, "ar", None, None),
    "al-fadila-lessons-____.pdf": ("دروس من كتاب الفضيلة", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "The Sheikh's lessons ON al-Manfaluti's book الفضيلة; do not present the book itself as the Sheikh's own work"),
    "mas-la-introductions-____.pdf": ("دروس مؤتمر MAS LA", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Lessons printed: العزم والتوكل، قيادة تلهم، الهجرة"),
    "____________________________________________________.pdf": ("من فضائل القرآن الكريم", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Short booklet (5 pp); Friday Nov 13 khutba text: الثقة، الاستقامة، نبذ الباطل"),
    "_16-_Series_of_-Proud_To_Be_Muslims-.pdf": (None, "Proud To Be Muslims", None, None, "en", None, "Series #16; title from filename; author NOT stated in the file — confirm authorship before crediting"),
    # Newsletters — the owner's own project, NOT the Sheikh's books
    "Noor-Sprouts-Newsletter-01-EN.pdf": (None, "Noor Sprouts Parenting Newsletter — Issue No. 1: Believing in the Unseen", None, None, "en", None, "Owner's own newsletter project, NOT a Sheikh book — review, do not list as his book"),
    "Noor-Sprouts-Newsletter-02-EN.pdf": (None, "Noor Sprouts Parenting Newsletter — Issue No. 2: The Language of Your Child's Prayer", None, None, "en", None, "Owner's own newsletter project, NOT a Sheikh book — review"),
    "_______-________-02-_______-____-_____.pdf": ("نشرة براعم النور التربوية", None, None, None, "ar", None, "Arabic edition, Issue 2: العربية وحفظ دين أولادنا; owner's own newsletter project — review"),
    # Khutba collections — title from each file's own title block, verified against the transcript's send list
    "___-___-____.pdf": ("خطب رجب", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-____-____.pdf": ("خطب الحج", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-____-_____-____-____.pdf": ("خطب سبعة يظلهم الله", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-____-_____-____.pdf": ("خطب أول العام", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_____-____-2.pdf": ("خطب رمضان", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_____-____.pdf": ("خطب شعبان", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_____-______-____-2.pdf": ("خطب تزكية النفوس", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_____-______-____.pdf": ("خطب قضايا الأمة", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_____-________-____.pdf": ("خطب الموت والآخرة", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-______-____.pdf": ("خطب الهجرة", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-______-______-____.pdf": ("خطب الحديث القدسي", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-______-_______-____.pdf": ("خطب السيرة النبوية", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-______-_________-____.pdf": ("خطب الدعوة والإصلاح", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_______-____.pdf": ("خطب الصحابة", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_______-_______-__-_____-____.pdf": ("خطب المجتمع والمسلم في الغرب", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_______-________-____.pdf": ("خطب الأسرة والتربية", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-________-____-2.pdf": ("خطب الإيمان", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-________-____-3.pdf": ("خطب العبادات", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-________-____.pdf": ("خطب الأخلاق", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
    "___-_________-____.pdf": ("خطب الأنبياء", None, SHEIKH_AR, SHEIKH_EN, "ar", None, "Khutba collection"),
}

# DOCX page counts (verified: app.xml / LibreOffice render)
DOCX_PAGES = {
    "______________________________________________.docx": 819,
    "_______________________________.docx": 32,
}

def ar_sort_key(s):
    """Arabic dictionary order for sorting only (display titles unchanged):
    alef variants -> ا, teh marbuta -> ه, alef maksura -> ي, strip tashkeel,
    and strip the definite article ال from each word (standard Arabic
    alphabetization ignores ال). Finding from the DeepSeek flash partial
    review trace: without ال-stripping, 'خطب أول العام' sorted after
    'خطب الهجرة'; with it, it sorts among the alif-initial words."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s)
    s = TASHKEEL.sub("", s)
    for a, b in (("أ", "ا"), ("إ", "ا"), ("آ", "ا")):
        s = s.replace(a, b)
    words = []
    for w in s.split():
        if w.startswith("ال") and len(w) > 2:
            w = w[2:]
        words.append(w)
    s = " ".join(words)
    for a, b in (("ة", "ه"), ("ى", "ي")):
        s = s.replace(a, b)
    return s

def build():
    missing = [f for f in D if f not in M]
    extra = [f for f in M if f not in D and f not in ("Part1_Cover_Wraparound.pdf", "Part2_Cover_Wraparound.pdf")]
    assert not missing, f"determination table missing files: {missing}"
    assert not extra, f"unaccounted files: {extra}"
    inv = []
    review = [
        {"group": "kahf", "issue": "duplicate", "rule": "normalized title match — three successive versions of one work",
         "files": ["kahf-khutbas-____-3.pdf", "kahf-khutbas-____-2.pdf", "kahf-khutbas-____.pdf"],
         "matches": "إضاءات من سورة الكهف — الجزء الأول, 126 pp (Nov 16) / 135 pp (Nov 18) / 138 pp (Nov 19)",
         "recommendation": "Owner keeps ONE version (likely the latest 138 pp, Nov 19); list it once decided"},
        {"group": "infidelity", "issue": "duplicate", "rule": "normalized title match — two versions of one work",
         "files": ["-_____.pdf", "_______-_______-____-_______-____-____.pdf"],
         "matches": "الخيانة الزوجية وسبل التعامل معها, 16 pp (Nov 7) vs 17 pp (Nov 17)",
         "recommendation": "Owner keeps ONE version (likely the later 17 pp, Nov 17); list it once decided"},
        {"group": "phd-docx", "issue": "duplicate", "rule": "same work, different format — source manuscript of the PhD book",
         "files": ["______________________________________________.docx"],
         "matches": "PhD book الفرقة بين الزوجين (4 parts, 1,057 pp total)",
         "recommendation": "Attach as the source-manuscript format of the PhD entry, not a separate book"},
        {"group": "newsletters", "issue": "not-sheikh-authored", "rule": "authorship — the owner's own Noor Sprouts newsletter project",
         "files": ["Noor-Sprouts-Newsletter-01-EN.pdf", "Noor-Sprouts-Newsletter-02-EN.pdf", "_______-________-02-_______-____-_____.pdf"],
         "matches": "—",
         "recommendation": "Exclude from the Sheikh's Books list; owner decides whether to list elsewhere and under what credit"},
    ]
    review_files = {f for r in review for f in r["files"]}
    phd_parts = []
    for fn, (ta, te, aa, ae, lang, part, note) in D.items():
        r = M[fn]
        pages = r["pages"] if r["pages"] is not None else DOCX_PAGES[fn]
        if fn.startswith("______-___-_______-____________-____"):
            phd_parts.append({"part": part, "file": fn, "pages": pages})
            continue
        if fn in review_files:
            continue
        inv.append({"id": None, "title_ar": disp(ta), "title_en": te, "author_ar": aa, "author_en": ae,
                    "language": lang, "pages": pages, "format": r["format"], "files": [fn],
                    "part": part, "parts": None, "cover_file": None, "companion": None,
                    "scan": bool(r.get("scan_flag")), "notes": note})
    # PhD entry: one title, four ordered parts
    phd_parts.sort(key=lambda p: p["part"])
    inv.append({"id": None, "title_ar": "الفرقة بين الزوجين", "title_en": None, "author_ar": SHEIKH_AR, "author_en": SHEIKH_EN,
                "language": "ar", "pages": sum(p["pages"] for p in phd_parts), "format": "pdf",
                "files": [p["file"] for p in phd_parts], "part": None, "parts": phd_parts,
                "cover_file": None, "companion": None, "scan": False,
                "notes": "The Sheikh's PhD book (dissertation, Graduate Theological Foundation 2014-2015, supervisor Dr. Salah al-Sawi); one title with four ordered parts per design verdict D15"})
    # Anta Tasalu covers
    for e in inv:
        if e["files"] == ["Part1_Interior_256pp.pdf"]:
            e["cover_file"] = "anta-v1-front.jpg"
        if e["files"] == ["Part2_Interior_204pp.pdf"]:
            e["cover_file"] = "anta-v2-front.jpg"
    # sort: PhD first, then Arabic by Arabic title (dictionary order), then English by English title
    def sort_key(e):
        if e["title_ar"] == "الفرقة بين الزوجين":
            return (0, 0, "")
        if e["language"] == "ar":
            return (1, 0, ar_sort_key(e["title_ar"]))
        return (1, 1, (e["title_en"] or "").lower())
    inv.sort(key=sort_key)
    for i, e in enumerate(inv, 1):
        e["id"] = f"book-{i:02d}"
    # companions: same-title other-language entries, matched by part number
    for e in inv:
        cands = [x for x in inv if x["title_ar"] == e["title_ar"] and x["language"] != e["language"]
                 and x["id"] != e["id"] and (x.get("part") == e.get("part"))]
        if cands:
            e["companion"] = cands[0]["id"]
        else:
            e["companion"] = None
    out = {"inventory": inv, "review": review,
           "cover_assets": [{"file": "Part1_Cover_Wraparound.pdf", "for_book": "anta-v1", "front_jpg": "anta-v1-front.jpg"},
                            {"file": "Part2_Cover_Wraparound.pdf", "for_book": "anta-v2", "front_jpg": "anta-v2-front.jpg"}],
           "counts": {"files_total": len(M), "listed": len(inv), "review_groups": len(review),
                      "review_files": sum(len(r["files"]) for r in review), "cover_assets": 2},
           "unaccounted_files": []}
    with open(HERE / "draft-inventory.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"listed: {len(inv)} | review groups: {len(review)} ({sum(len(r['files']) for r in review)} files) | files: {len(M)}")
    for e in inv:
        print(f"{e['id']} | {e['language']} | {e['pages']}pp | {e['title_ar'] or ''} | {e['title_en'] or ''} | part={e['part']} | comp={e['companion']} | files={len(e['files'])}")
    print("REVIEW:")
    for r in review:
        print(f"  {r['group']} | {r['issue']} | {len(r['files'])} files | {r['recommendation'][:70]}")

if __name__ == "__main__":
    build()
