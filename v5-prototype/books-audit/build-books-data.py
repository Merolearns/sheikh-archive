#!/usr/bin/env python3
"""Track 3 prototype: generate books-data.js from books-inventory.json.

Mechanical only: no titles, authors, or counts are invented here — every
field comes from the inventory JSON. The data file is shared by the installed
flavor (books.html, with file links under books/files/) and the preview flavor
(books-preview.html, metadata only, never renders a file link).
"""
import json
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

BLURBS = {
    # keyed by book id; the title assertion below fails loudly if the
    # inventory order ever changes. Public, displayable text only.
    "book-01": ("كتاب الدكتوراه للشيخ: رسالة دكتوراه في الفقه المقارن، مؤسسة الدراسات اللاهوتية للخريجين ٢٠١٤-٢٠١٥، بإشراف د. صلاح الصاوي",
                "The Sheikh's PhD book: a dissertation in comparative fiqh, Graduate Theological Foundation 2014-2015, supervised by Dr. Salah al-Sawi",
                "الفرقة بين الزوجين"),
    "book-02": ("خواطر العشاء", "Dinner reflections", "إضاءات من سورة الفاتحة"),
    "book-03": ("٤٠٥ مسائل شرعية في ١٥ بابًا، جمع وإعداد م. عمرو محمود",
                "405 questions in 15 chapters; compiled by Amr Mahmoud", "أنت تسأل والشيخ يجيب"),
    "book-04": ("٣٠٣ مسائل شرعية في ١٥ بابًا، جمع وإعداد م. عمرو محمود",
                "303 questions in 15 chapters; compiled by Amr Mahmoud", "أنت تسأل والشيخ يجيب"),
    "book-26": ("دروس المؤتمر: العزم والتوكل، قيادة تلهم، الهجرة",
                "Conference lessons: resolve and reliance, inspiring leadership, the Hijra", "دروس مؤتمر MAS LA"),
    "book-27": ("دروس الشيخ على كتاب الفضيلة للمنفلوطي",
                "The Sheikh's lessons on al-Manfaluti's book al-Fadila", "دروس من كتاب الفضيلة"),
    "book-28": ("نحو أسرة مسلمة سعيدة", "Towards a happy Muslim family", "فقه الزواج الميسر"),
    "book-29": ("الكتاب الكامل", "The complete book", "قصص الأنبياء"),
    "book-32": ("نص خطبة الجمعة", "Friday sermon text", "من فضائل القرآن الكريم"),
}

def main():
    inv = json.load(open(HERE / "books-inventory.json", encoding="utf-8"))
    books = []
    for e in inv["inventory"]:
        blurb = None
        if e["id"] in BLURBS:
            ar, en, expect = BLURBS[e["id"]]
            assert e["title_ar"] == expect, f"blurb id {e['id']} now points at {e['title_ar']!r}, expected {expect!r}"
            blurb = {"ar": ar, "en": en}
        books.append({
            "id": e["id"],
            "title_ar": e["title_ar"],
            "title_en": e["title_en"],
            "author_ar": e["author_ar"],
            "author_en": e["author_en"],
            "language": e["language"],
            "pages": e["pages"],
            "format": e["format"],
            "files": [f"books/files/{f}" for f in e["files"]],
            "part": e.get("part"),
            "parts": e.get("parts"),
            "cover": f"books/covers/{e['cover_file']}" if e.get("cover_file") else None,
            "companion": e.get("companion"),
            "blurb": blurb,
        })
    data = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "counts": inv["counts"],
        "books": books,
    }
    js = ("/* Books data — generated mechanically from books-audit/books-inventory.json.\n"
          "   Do not hand-edit: regenerate with books-audit/build-books-data.py. */\n"
          "window.BOOKS = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    (ROOT / "books-data.js").write_text(js, encoding="utf-8")
    print(f"wrote books-data.js: {len(books)} books, {len(js)} bytes")

if __name__ == "__main__":
    main()
