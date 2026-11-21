#!/usr/bin/env python3
"""Build the Books metadata from the staged files the Sheikh sent.

Run from v5/:  python3 tools/build_books.py
Reads books-from-sheikh/ (never writes there). Writes audit/incoming-books.json,
src/books.json and build-books/covers/<id>.jpg. Then run tools/dedup.py.

Titles, credits and original names below are copied from each file's own title
page / PDF metadata and from books-from-sheikh/EXCHANGE-Nov7-Nov20.md.
"""

import hashlib
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

V5 = Path(__file__).resolve().parent.parent
SRC = V5 / "books-from-sheikh"
COVERS = V5 / "build-books" / "covers"
DR = "د. مصطفى سليمان محمد كامل"
DR_EN = "Dr. Moustafa Sulayman Muhammad Kamel"
ANTA = "أجوبة فضيلة الشيخ الدكتور مصطفى كامل؛ جمع وإعداد: م. عمرو محمود"

# (id, order, staged path, original name, sent, title_ar, title_en, lang, author, edition_of)
LISTED = [
    # Major books
    (
        "furqa-1",
        1,
        "books/______-___-_______-____________-____.pdf",
        "الفرقة-بين-الزوجين-الجزء الأول-ملون.pdf",
        "2026-11-16",
        "الفرقة بين الزوجين في التشريع الإسلامي والقانون الأمريكي (كاليفورنيا نموذجا) - الجزء الأول",
        None,
        "ar",
        DR + "؛ إشراف: د. صلاح الصاوي",
        None,
    ),
    (
        "furqa-2",
        2,
        "books/______-___-_______-____________-____-2.pdf",
        "الفرقة-بين-الزوجين-الجزء الثاني-ملون.pdf",
        "2026-11-16",
        "الفرقة بين الزوجين في التشريع الإسلامي والقانون الأمريكي (كاليفورنيا نموذجا) - الجزء الثاني",
        None,
        "ar",
        DR + "؛ إشراف: د. صلاح الصاوي",
        None,
    ),
    (
        "furqa-3",
        3,
        "books/______-___-_______-____________-____-3.pdf",
        "الفرقة-بين-الزوجين-الجزء الثالث-ملون.pdf",
        "2026-11-16",
        "الفرقة بين الزوجين في التشريع الإسلامي والقانون الأمريكي (كاليفورنيا نموذجا) - الجزء الثالث",
        None,
        "ar",
        DR + "؛ إشراف: د. صلاح الصاوي",
        None,
    ),
    (
        "furqa-4",
        4,
        "books/______-___-_______-____________-____-4.pdf",
        "الفرقة-بين-الزوجين-الجزء الرابع-ملون.pdf",
        "2026-11-16",
        "الفرقة بين الزوجين في التشريع الإسلامي والقانون الأمريكي (كاليفورنيا نموذجا) - الجزء الرابع",
        None,
        "ar",
        DR + "؛ إشراف: د. صلاح الصاوي",
        None,
    ),
    (
        "fiqh-zawaj",
        5,
        "books/___-______-______-____-2.pdf",
        "فقه-الزواج-الميسر-ملون.pdf",
        "2026-11-16",
        "فقه الزواج الميسر (نحو أسرة مسلمة سعيدة)",
        None,
        "ar",
        "مصطفى سليمان محمد كامل",
        None,
    ),
    (
        "khiyana",
        6,
        "books/_______-_______-____-_______-____-____.pdf",
        "الخيانة-الزوجية-وسبل-التعامل-معها-ملون.pdf",
        "2026-11-17",
        "الخيانة الزوجية وسبل التعامل معها",
        None,
        "ar",
        "د. مصطفى سليمان كامل",
        None,
    ),
    (
        "anta-tasal-1",
        7,
        "Part1_Interior_256pp.pdf",
        "Part1_Interior_256pp.pdf",
        None,
        "أنت تسأل والشيخ يجيب - الجزء الأول",
        None,
        "ar",
        ANTA,
        None,
    ),
    (
        "anta-tasal-2",
        8,
        "Part2_Interior_204pp.pdf",
        "Part2_Interior_204pp.pdf",
        None,
        "أنت تسأل والشيخ يجيب - الجزء الثاني",
        None,
        "ar",
        ANTA,
        None,
    ),
    (
        "prophets-stories",
        9,
        "books/prophets-stories-complete-book-____.pdf",
        "prophets-stories-complete-book-ملون.pdf",
        "2026-11-16",
        "قصص الأنبياء - الكتاب الكامل",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "moses-story",
        10,
        "books/moses-story-book-____.pdf",
        "moses-story-book-ملون.pdf",
        "2026-11-16",
        "قصة موسى عليه السلام",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "seerah-ar-1",
        11,
        "books/_____-__-______-_______-_____-______-____.pdf",
        "وقفات-من-السيرة-النبوية-الجزء-الأول-ملون.pdf",
        "2026-11-18",
        "وقفات من السيرة النبوية - الجزء الأول",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "seerah-ar-2",
        12,
        "books/_____-__-______-_______-_____-______-____-2.pdf",
        "وقفات-من-السيرة-النبوية-الجزء-الثاني-ملون.pdf",
        "2026-11-18",
        "وقفات من السيرة النبوية - الجزء الثاني",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "fatiha-ar",
        13,
        "books/_______-__-____-_______-_____-______-____.pdf",
        "إضاءات-من-سورة-الفاتحة-خواطر-العشاء-ملون.pdf",
        "2026-11-20",
        "إضاءات من سورة الفاتحة (خواطر العشاء)",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "usul-fiqh",
        14,
        "books/usul-al-fiqh-lessons-____.pdf",
        "usul-al-fiqh-lessons-ملون.pdf",
        "2026-11-16",
        "دروس أصول الفقه للمبتدئين",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "fadila",
        15,
        "books/al-fadila-lessons-____.pdf",
        "al-fadila-lessons-ملون.pdf",
        "2026-11-16",
        "دروس من كتاب الفضيلة للمنفلوطي",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "mas-la",
        16,
        "books/mas-la-introductions-____.pdf",
        "mas-la-introductions-ملون.pdf",
        "2026-11-16",
        "دروس مؤتمر MAS LA: العزم والتوكل، قيادة تلهم، الهجرة",
        None,
        "ar",
        DR,
        None,
    ),
    # Khutba collections, in the order the Sheikh sent them
    (
        "kahf-1",
        17,
        "books/kahf-khutbas-____.pdf",
        "kahf-khutbas-ملون.pdf",
        "2026-11-19",
        "إضاءات من سورة الكهف - الجزء الأول",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-ramadan",
        18,
        "books/___-_____-____-2.pdf",
        "خطب-رمضان-ملون.pdf",
        "2026-11-17",
        "خطب رمضان",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-shaban",
        19,
        "books/___-_____-____.pdf",
        "خطب-شعبان-ملون.pdf",
        "2026-11-17",
        "خطب شعبان",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-rajab",
        20,
        "books/___-___-____.pdf",
        "خطب-رجب-ملون.pdf",
        "2026-11-17",
        "خطب رجب",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-awwal-alam",
        21,
        "books/___-____-_____-____.pdf",
        "خطب-أول-العام-ملون.pdf",
        "2026-11-17",
        "خطب أول العام",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-hajj",
        22,
        "books/___-____-____.pdf",
        "خطب-الحج-ملون.pdf",
        "2026-11-17",
        "خطب الحج",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-ibadat",
        23,
        "books/___-________-____-3.pdf",
        "خطب-العبادات-ملون.pdf",
        "2026-11-17",
        "خطب العبادات",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-iman",
        24,
        "books/___-________-____-2.pdf",
        "خطب-الإيمان-ملون.pdf",
        "2026-11-17",
        "خطب الإيمان",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-mawt",
        25,
        "books/___-_____-________-____.pdf",
        "خطب-الموت-والآخرة-ملون.pdf",
        "2026-11-17",
        "خطب الموت والآخرة",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-sabaa",
        26,
        "books/___-____-_____-____-____.pdf",
        "خطب-سبعة-يظلهم-الله-ملون.pdf",
        "2026-11-17",
        "خطب سبعة يظلهم الله",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-akhlaq",
        27,
        "books/___-________-____.pdf",
        "خطب-الأخلاق-ملون.pdf",
        "2026-11-17",
        "خطب الأخلاق",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-tazkiya",
        28,
        "books/___-_____-______-____-2.pdf",
        "خطب-تزكية-النفوس-ملون.pdf",
        "2026-11-17",
        "خطب تزكية النفوس",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-usra",
        29,
        "books/___-_______-________-____.pdf",
        "خطب-الأسرة-والتربية-ملون.pdf",
        "2026-11-17",
        "خطب الأسرة والتربية",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-mujtama",
        30,
        "books/___-_______-_______-__-_____-____.pdf",
        "خطب-المجتمع-والمسلم-في-الغرب-ملون.pdf",
        "2026-11-17",
        "خطب المجتمع والمسلم في الغرب",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-sira",
        31,
        "books/___-______-_______-____.pdf",
        "خطب-السيرة-النبوية-ملون.pdf",
        "2026-11-17",
        "خطب السيرة النبوية",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-hijra",
        32,
        "books/___-______-____.pdf",
        "خطب-الهجرة-ملون.pdf",
        "2026-11-17",
        "خطب الهجرة",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-anbiya",
        33,
        "books/___-_________-____.pdf",
        "خطب-الأنبياء-ملون.pdf",
        "2026-11-17",
        "خطب الأنبياء",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-sahaba",
        34,
        "books/___-_______-____.pdf",
        "خطب-الصحابة-ملون.pdf",
        "2026-11-17",
        "خطب الصحابة",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-qadaya",
        35,
        "books/___-_____-______-____.pdf",
        "خطب-قضايا-الأمة-ملون.pdf",
        "2026-11-17",
        "خطب قضايا الأمة",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-dawa",
        36,
        "books/___-______-_________-____.pdf",
        "خطب-الدعوة-والإصلاح-ملون.pdf",
        "2026-11-17",
        "خطب الدعوة والإصلاح",
        None,
        "ar",
        DR,
        None,
    ),
    (
        "khutab-qudsi",
        37,
        "books/___-______-______-____.pdf",
        "خطب-الحديث-القدسي-ملون.pdf",
        "2026-11-17",
        "خطب الحديث القدسي",
        None,
        "ar",
        DR,
        None,
    ),
    # English editions (the Arabic title is the one printed on the book; part from the paired Arabic edition)
    (
        "seerah-en-1",
        38,
        "books/educational-reflections-on-the-seerah-part-one.pdf",
        "educational-reflections-on-the-seerah-part-one.pdf",
        "2026-11-18",
        "وقفات من السيرة النبوية - الجزء الأول",
        "Educational Reflections on the Seerah, Part One",
        "en",
        DR_EN,
        "seerah-ar-1",
    ),
    (
        "seerah-en-2",
        39,
        "books/educational-reflections-on-the-seerah-part-two.pdf",
        "educational-reflections-on-the-seerah-part-two.pdf",
        "2026-11-18",
        "وقفات من السيرة النبوية - الجزء الثاني",
        "Educational Reflections on the Seerah, Part Two",
        "en",
        DR_EN,
        "seerah-ar-2",
    ),
    (
        "fatiha-en",
        40,
        "books/illuminations-from-surah-al-fatiha-dinner-reflections.pdf",
        "illuminations-from-surah-al-fatiha-dinner-reflections.pdf",
        "2026-11-20",
        "إضاءات من سورة الفاتحة (خواطر العشاء)",
        "Illuminations from Surah al-Fatiha (Dinner Reflections)",
        "en",
        DR_EN,
        "fatiha-ar",
    ),
]

# (staged path, original name, sent, title_ar, title_en, lang, author as printed, hold reason)
HELD = [
    (
        "books/kahf-khutbas-____-3.pdf",
        "kahf-khutbas-ملون.pdf",
        "2026-11-16",
        "إضاءات من سورة الكهف - الجزء الأول",
        None,
        "ar",
        DR,
        "Earlier revision (126 pp, 36 khutbas) of the listed kahf-1 (138 pp, sent Nov 19).",
    ),
    (
        "books/kahf-khutbas-____-2.pdf",
        "kahf-khutbas-ملون.pdf",
        "2026-11-18",
        "إضاءات من سورة الكهف - الجزء الأول",
        None,
        "ar",
        DR,
        "Earlier revision (135 pp, 37 khutbas) of the listed kahf-1 (138 pp, sent Nov 19).",
    ),
    (
        "books/-_____.pdf",
        "-.pdf",
        "2026-11-07",
        "الخيانة الزوجية و سبل التعامل معها",
        None,
        "ar",
        "د. مصطفى سليمان كامل، د. صلاح الصاوي",
        "Earlier edition (16 pp, Nov 7) of the listed khiyana (17 pp coloured, Nov 17). Credits differ: this one also credits Dr. Salah al-Sawy, the Nov 17 one credits only the Sheikh.",
    ),
    (
        "books/Noor-Sprouts-Newsletter-01-EN.pdf",
        "Noor-Sprouts-Newsletter-01-EN.pdf",
        "2026-11-07",
        None,
        "Noor Sprouts Parenting Newsletter, Issue No. 1: Believing in the Unseen",
        "en",
        "Noor Sprouts Academy",
        "Newsletter by Noor Sprouts Academy, not a book by the Sheikh.",
    ),
    (
        "books/Noor-Sprouts-Newsletter-02-EN.pdf",
        "Noor-Sprouts-Newsletter-02-EN.pdf",
        "2026-11-14",
        None,
        "Noor Sprouts Parenting Newsletter, Issue No. 2: The Language of Your Child's Prayer",
        "en",
        "Noor Sprouts Academy",
        "Newsletter by Noor Sprouts Academy, not a book by the Sheikh.",
    ),
    (
        "books/_______-________-02-_______-____-_____.pdf",
        "النشرة-التربوية-02-العربية-وحفظ-الدين.pdf",
        "2026-11-14",
        "نشرة براعم النور التربوية، العدد الثاني: العربية وحفظ دين أولادنا",
        None,
        "ar",
        "Noor Sprouts Academy",
        "Newsletter by Noor Sprouts Academy, not a book by the Sheikh.",
    ),
    (
        "books/_16-_Series_of_-Proud_To_Be_Muslims-.pdf",
        "#16- Series of -Proud To Be Muslims-.pdf",
        "2026-11-16",
        None,
        '#16: Series of "Proud To Be Muslims"',
        "en",
        "",
        "Children's weekly worksheet with no author credit.",
    ),
    (
        "books/____________________________________________________.pdf",
        "من فضائل القرآن الكريم الثقة الاستقامة نبذ الباطل.pdf",
        "2026-11-13",
        "من فضائل القرآن الكريم",
        None,
        "ar",
        "",
        "5-page khutba handout (Nov 13, 2026); no printed credit, PDF Author field is 'hosni ibrahim'. Credit unclear.",
    ),
    (
        "books/______________________________________________.docx",
        "بحث الدكتوراه انتهيت منه تماما بصيعة الوورد.docx",
        "2026-11-07",
        "الفرقة بين الزوجين فى التشريع الإسلامى والقانون الأمريكى ( كاليفورنيا )",
        None,
        "ar",
        "مصطفى سليمان محمد كامل",
        "DOCX does not open natively in the browser; ask the owner for a PDF. Also likely the source of the four-part furqa books (Sheikh's Nov 16 message).",
    ),
    (
        "books/_______________________________.docx",
        "مسائل في مشكلات الحياة الزوجية.docx",
        "2026-11-07",
        "مسائل في مشكلات الحياة الزوجية",
        None,
        "ar",
        "",
        "DOCX does not open natively in the browser; ask the owner for a PDF. No title page; title taken from the file name he sent; no printed credit.",
    ),
]


def run(*cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def pdf_pages(p):
    return int(re.search(r"^Pages:\s+(\d+)", run("pdfinfo", str(p)), re.M).group(1))


def is_scan(p, pages):
    text = re.sub(r"\s", "", run("pdftotext", str(p), "-"))
    return (
        len(text) < 20 * pages
    )  # shortcut: under ~20 chars/page means no usable text layer


def file_facts(rel):
    p = SRC / rel
    data = p.read_bytes()
    out = {
        "source_file": rel,
        "sha256": hashlib.sha256(data).hexdigest(),
        "bytes": len(data),
    }
    if p.suffix == ".pdf":
        out["pages"] = pdf_pages(p)
        out["scan"] = is_scan(p, out["pages"])
    else:
        out["pages"] = None
        out["scan"] = None
    return out


def front_panel_cover(book_id, cover_pdf):
    """Crop the front panel of a wraparound cover: the half without 'عن هذا الكتاب'."""
    from PIL import Image

    bbox = run("pdftotext", "-bbox", str(cover_pdf), "-")
    width = float(re.search(r'<page width="([\d.]+)"', bbox).group(1))
    back_x = None
    for x, w in re.findall(r'<word xMin="([\d.]+)"[^>]*>([^<]*)</word>', bbox):
        w = unicodedata.normalize("NFKC", w)
        if "الكتاب" in (w, w[::-1]):  # bbox mode can emit Arabic words reversed
            back_x = float(x)
            break
    if back_x is None:
        raise SystemExit(f"{cover_pdf}: cannot find the back-cover blurb")
    panel = (
        170 / 25.4 * 72
    )  # trim width 17 cm (PRINTER_SPECS); spine sits between panels
    tmp = COVERS.parent / "tmp" / f"{book_id}-wrap"
    tmp.parent.mkdir(parents=True, exist_ok=True)
    run(
        "pdftoppm",
        "-f",
        "1",
        "-l",
        "1",
        "-r",
        "150",
        "-png",
        "-singlefile",
        str(cover_pdf),
        str(tmp),
    )
    im = Image.open(f"{tmp}.png")
    s = im.width / width
    box = (
        (round((width - panel) * s), 0, im.width, im.height)
        if back_x < width / 2
        else (0, 0, round(panel * s), im.height)
    )
    front = im.crop(box).convert("RGB")
    front.thumbnail((480, 480))
    front.save(COVERS / f"{book_id}.jpg", quality=85)
    return "front" if back_x < width / 2 else "front-left"


def main():
    COVERS.mkdir(parents=True, exist_ok=True)
    incoming, books = [], []
    for bid, order, rel, orig, sent, tar, ten, lang, author, ed in LISTED:
        f = file_facts(rel)
        incoming.append(
            {
                "book_id": bid,
                "status": "listed",
                "original_name": orig,
                "sent": sent,
                "title_ar": tar,
                "title_en": ten,
                "lang": lang,
                "author": author,
                **f,
                "hold_reason": None,
            }
        )
        books.append(
            {
                "id": bid,
                "order": order,
                "title_ar": tar,
                "title_en": ten,
                "lang": lang,
                "author": author,
                "pages": f["pages"],
                "file": f"books/{bid}.pdf",
                "source_file": rel,
                "sha256": f["sha256"],
                "bytes": f["bytes"],
                "scan": f["scan"],
                "cover": f"books/covers/{bid}.jpg",
                "edition_of": ed,
            }
        )
        if bid.startswith("anta-tasal-"):
            front_panel_cover(
                bid,
                SRC
                / rel.replace("Interior", "Cover_Wraparound")
                .replace("_256pp", "")
                .replace("_204pp", ""),
            )
        else:
            run(
                "pdftoppm",
                "-f",
                "1",
                "-l",
                "1",
                "-scale-to",
                "480",
                "-jpeg",
                "-jpegopt",
                "quality=85",
                "-singlefile",
                str(SRC / rel),
                str(COVERS / bid),
            )
    for rel, orig, sent, tar, ten, lang, author, reason in HELD:
        incoming.append(
            {
                "book_id": None,
                "status": "held",
                "original_name": orig,
                "sent": sent,
                "title_ar": tar,
                "title_en": ten,
                "lang": lang,
                "author": author,
                **file_facts(rel),
                "hold_reason": reason,
            }
        )

    staged = {str(p.relative_to(SRC)) for p in (SRC / "books").iterdir()}
    staged |= {"Part1_Interior_256pp.pdf", "Part2_Interior_204pp.pdf"}
    seen = [i["source_file"] for i in incoming]
    assert sorted(seen) == sorted(staged), set(staged) ^ set(
        seen
    )  # every staged file accounted for exactly once
    for b in books:
        assert Path(COVERS / f"{b['id']}.jpg").stat().st_size > 0

    for path, obj in (
        (V5 / "audit" / "incoming-books.json", {"items": incoming}),
        (V5 / "src" / "books.json", {"books": books}),
    ):
        text = json.dumps(obj, ensure_ascii=False, indent=1) + "\n"
        assert "—" not in text and "–" not in text, path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
    print(f"listed {len(books)}, held {len(HELD)}, covers in {COVERS}")


if __name__ == "__main__":
    sys.exit(main())
