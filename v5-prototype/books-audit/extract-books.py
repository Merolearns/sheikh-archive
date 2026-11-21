#!/usr/bin/env python3
"""Track 3 prototype: extract real metadata from every book-candidate file.

Reads each PDF (pypdf: page count, /Title, /Author, first-page + sampled-page
text) and DOCX (python-docx: core properties, first heading). Writes
raw-extraction.json. Never invents: anything not found is null.
"""
import json, os, re, sys
from pathlib import Path

SRC = Path.home() / "workspace/archive-rebuild/v5/books-from-sheikh"
OUT = Path.home() / "workspace/archive-rebuild/v5-prototype/books-audit"
OUT.mkdir(parents=True, exist_ok=True)

AR_RE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")

def clean(s):
    if not s:
        return None
    s = " ".join(str(s).split())
    return s or None

def lang_of(text):
    if not text:
        return None
    ar = len(AR_RE.findall(text))
    latin = len(re.findall(r"[A-Za-z]", text))
    if ar > 0 and latin == 0:
        return "ar"
    if ar > 0 and latin > 0:
        return "mixed"
    if latin > 0:
        return "en"
    return None

def pdf_info(path):
    from pypdf import PdfReader
    r = PdfReader(str(path))
    pages = len(r.pages)
    meta = r.metadata or {}
    title = clean(getattr(meta, "title", None))
    author = clean(getattr(meta, "author", None))
    # first page text (up to 3 pages if first is empty)
    first_text = ""
    for i in range(min(3, pages)):
        try:
            t = r.pages[i].extract_text() or ""
        except Exception:
            t = ""
        if t.strip():
            first_text = t
            break
    # sampled text: pages 0, middle, last — check whether any text exists
    sampled = 0
    text_pages = 0
    for i in sorted({0, pages // 2, pages - 1}):
        try:
            t = r.pages[i].extract_text() or ""
        except Exception:
            t = ""
        if t.strip():
            text_pages += 1
        sampled += 1
    # first non-empty line of first text as candidate display title
    # (skip the basmala and other opening formulae; keep a title block)
    BASMALA = re.compile(r"^[\s\u0600-\u06FF]*?(بسم|ٱسم|اسم)\s+الله", re.UNICODE)
    cand = None
    block = []
    if first_text:
        for line in first_text.splitlines():
            line = line.strip()
            if len(line) < 3:
                continue
            if re.match(r"^(Page|page|\d+)\s*$", line):
                continue
            if BASMALA.search(line) and len(line) < 60:
                continue
            if line in ("ﷲ", "الله"):
                continue
            block.append(line[:200])
            if cand is None:
                cand = line[:200]
            if len(block) >= 8:
                break
    return {
        "format": "pdf",
        "pages": pages,
        "meta_title": title,
        "meta_author": author,
        "first_page_title_candidate": cand,
        "title_block": block,
        "first_page_text_lang": lang_of(first_text),
        "first_page_text_sample": clean(first_text[:600]) if first_text else None,
        "text_layer": text_pages > 0,
        "text_pages_sampled": f"{text_pages}/{sampled}",
        "scan_flag": text_pages == 0,
    }

def docx_info(path):
    import docx
    d = docx.Document(str(path))
    cp = d.core_properties
    paras = [p.text.strip() for p in d.paragraphs if p.text.strip()]
    first = paras[0][:200] if paras else None
    heading = None
    for p in d.paragraphs:
        if p.style.name.lower().startswith("heading") and p.text.strip():
            heading = p.text.strip()[:200]
            break
    return {
        "format": "docx",
        "pages": None,
        "meta_title": clean(getattr(cp, "title", None)),
        "meta_author": clean(getattr(cp, "author", None)),
        "first_page_title_candidate": heading or first,
        "first_page_text_lang": lang_of(" ".join(paras[:5])),
        "first_page_text_sample": clean(" ".join(paras[:3])[:600]) if paras else None,
        "text_layer": len(paras) > 0,
        "text_pages_sampled": None,
        "scan_flag": False,
        "paragraph_count": len(paras),
    }

results = []
book_dirs = [SRC / "books", SRC]
for base in book_dirs:
    for path in sorted(base.iterdir()):
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        if ext not in (".pdf", ".docx"):
            continue
        rec = {
            "source_path": str(path.relative_to(SRC)),
            "filename": path.name,
            "bytes": path.stat().st_size,
        }
        try:
            if ext == ".pdf":
                rec.update(pdf_info(path))
            else:
                rec.update(docx_info(path))
            rec["error"] = None
        except Exception as e:
            rec["error"] = f"{type(e).__name__}: {e}"
            rec.update({"format": ext[1:], "pages": None, "meta_title": None,
                        "meta_author": None, "first_page_title_candidate": None,
                        "first_page_text_lang": None, "first_page_text_sample": None,
                        "text_layer": None, "scan_flag": None})
        results.append(rec)
        print(f"{rec['filename']} | {rec.get('format')} | pages={rec.get('pages')} | "
              f"title={rec.get('meta_title') or rec.get('first_page_title_candidate')} | "
              f"lang={rec.get('first_page_text_lang')} | scan={rec.get('scan_flag')} | err={rec['error']}")

with open(OUT / "raw-extraction.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=1)
print(f"\nTotal files: {len(results)}; errors: {sum(1 for r in results if r['error'])}")
print("Wrote", OUT / "raw-extraction.json")
