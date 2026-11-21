#!/usr/bin/env python3
"""Track 3 prototype: DeepSeek REVIEW of the mechanically built draft inventory.

The first call (generation from 52 raw files) burned out: 30,000 completion
tokens all spent on reasoning, finish_reason=length, content empty. This call
is the recovery per the skill: a REVIEW of a compact draft inventory — the
kind of independent diagnosis DeepSeek is best at — with a much smaller
reasoning load. Verdict-first JSON. --max-tokens 30000.
"""
import json, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEEPSEEK = Path.home() / "workspace/custom-connectors/custom.deepseek/bin/deepseek-chat"

draft = json.load(open(HERE / "draft-inventory.json", encoding="utf-8"))
raw = json.load(open(HERE / "raw-extraction.json", encoding="utf-8"))

compact_raw = [
    {"f": r["filename"], "pages": r["pages"], "fmt": r["format"],
     "title_block": (r.get("title_block") or [])[:4], "scan": bool(r.get("scan_flag"))}
    for r in raw
]

prompt = f"""You are an independent reviewer. A draft Books inventory for an offline Arabic Islamic library was built mechanically from the files themselves. Your job is to HUNT FOR ERRORS in it. Do not rebuild the inventory. Do not invent anything.

VERDICT FIRST. Output one JSON object only, no prose before or after it:
{{"verdict": "APPROVE" | "APPROVE WITH CORRECTIONS" | "REJECT",
  "corrections": [{{"book_id_or_file": "...", "field": "...", "current": "...", "corrected": "...", "reason": "...", "evidence": "..."}}],
  "holes": ["anything the draft fails to record or decide that matters"],
  "missed_duplicates": ["any two listed entries that are the same work, with the rule that fires"],
  "notes": ["short observations, max 5"]}}

DRAFT INVENTORY (38 listed entries, 4 review groups):
{json.dumps(draft, ensure_ascii=False)}

RAW EXTRACTION (52 files: filename, verified pages, first-page title block lines, scan flag):
{json.dumps(compact_raw, ensure_ascii=False)}

VERIFIED FACTS (do not contradict these; they were checked firsthand):
- Author is Dr. Moustafa Suleiman Kamel (مصطفى سليمان كامل) for every Sheikh book: his bio (dictated by him, Nov 7 2026) gives the name, Al-Azhar 1992, PhD 2015 in comparative fiqh, dissertation "الفرقة بين الزوجين في الشريعة الإسلامية وقانون الأسرة الأمريكي في كاليفورنيا", supervisor Dr. Salah al-Sawi, Graduate Theological Foundation 2014-2015.
- PhD book = ONE title with four ordered parts, 330+230+286+211 = 1,057 pp (WhatsApp send records, Nov 16).
- Seerah Arabic: 92 pp file = Part 1 (sent Nov 18 6:30 PM), 55 pp file = Part 2 (6:31 PM). English parts 1-2 = 124/76 pp.
- Anta Tasalu: Vol 1 = 405 questions, 15 chapters, 256 pp; Vol 2 = 303 questions, 15 chapters, 204 pp; answers by the Sheikh; compiled by Amr Mahmoud. Front covers verified by eye (dark green, gold calligraphy).
- The two DOCX files have no readable first page: identified by MANIFEST byte size — 1,768,577 B file = the 819-page PhD dissertation manuscript; 137,565 B file = مسائل في مشكلات الحياة الزوجية, 32 pp verified by LibreOffice render.
- Kahf: three successive versions of one work, same printed title إضاءات من سورة الكهف — الجزء الأول, 126 pp (Nov 16) / 135 pp (Nov 18) / 138 pp (Nov 19). Infidelity: two versions, 16 pp (Nov 7) / 17 pp (Nov 17).
- Noor Sprouts newsletters (2 English + 1 Arabic) are the OWNER's own project, not the Sheikh's books.
- Al-Fadila file = the Sheikh's lessons ON al-Manfaluti's book الفضيلة, not the book itself.
- Proud To Be Muslims #16: no author is stated anywhere in the file.
- Titles in the draft were transcribed from each file's own first-page title block (presentation-form glyphs normalized to standard Arabic script, tashkeel stripped for display).
- Sort: PhD first, then Arabic titles in Arabic dictionary order, then English titles. Arabic titles with no English title have title_en null; English-only books have title_ar null.

CHECK, in this order:
1. Every listed title against its file's title-block lines — wrong title, wrong spelling, wrong part number.
2. Every author credit — only credit what the facts above support; flag any over-credit (e.g. presenting al-Fadila's book as his own, or crediting Proud #16).
3. Every page count against the raw extraction (DOCX counts: 819 and 32).
4. Groupings: PhD 4 parts under one entry; Seerah AR/EN parts paired by part number; Fatiha AR/EN paired; Anta Tasalu as two separate volumes, not one entry.
5. Missed duplicates between listed entries (normalized Arabic title, English title, file name). The review groups already hold: Kahf trio, infidelity pair, PhD DOCX, newsletters.
6. Companion links (book-02<->book-37, book-33<->book-35, book-34<->book-36) — correct pairings?
7. Sort order errors in the Arabic list.
8. Anything invented (a title, author, page count, or claim with no evidence in the raw extraction or the verified facts).

If a check passes, say nothing about it. List ONLY real errors, holes, and missed duplicates. Empty corrections with verdict APPROVE is a valid outcome.
"""

out = HERE / "deepseek-review-raw.json"
cmd = [str(DEEPSEEK), "--model", "deepseek-v4-pro", "--max-tokens", "30000", "--raw", "--prompt", prompt]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=1200)
print(r.stdout[-2000:])
print(r.stderr[-1000:], file=sys.stderr)
sys.exit(r.returncode)
