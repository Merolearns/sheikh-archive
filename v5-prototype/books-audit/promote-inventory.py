#!/usr/bin/env python3
"""Track 3 prototype: promote draft-inventory.json to the final artifacts.

- books-inventory.json: the public list (38 entries) + review groups + counts
  + review_status (DeepSeek outcome + verification basis).
- owner-review-list.json: the 4 review groups + the Proud #16 authorship
  question, as the owner's decision list. Duplicates are NEVER listed.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

draft = json.load(open(HERE / "draft-inventory.json", encoding="utf-8"))

final = {
    "generated": datetime.now(timezone.utc).isoformat(),
    "source": "52 book-candidate files in v5/books-from-sheikh (46 PDF + 2 DOCX + 4 Anta Tasalu PDFs); titles from each file's own first page; pages verified (pypdf / app.xml / LibreOffice render)",
    "counts": draft["counts"],
    "review_status": {
        "deepseek": "SILENT after 3 attempts, all finish_reason=length with the whole completion budget spent on reasoning tokens and empty content: (1) v4-pro generation, 30000 cap, 41553 tokens; (2) v4-pro review of the draft, 30000 cap, 44689 tokens; (3) flash review, 8000 cap, 22636 tokens. One usable finding was recovered from the flash call's partial trace (Arabic sort must ignore the definite article ال) and was verified independently and adopted. No verdict JSON was ever returned; the missing voice is carried as a gap, not as agreement.",
        "verification_basis": "mechanical triple-check: (a) each title against its file's first-page title block; (b) each page count against pypdf/app.xml/LibreOffice; (c) each grouping against the WhatsApp transcript send records (EXCHANGE-Nov7-Nov20.md) and MANIFEST.json byte sizes. 52/52 files accounted exactly once, 0 duplicates in the public list.",
        "recheck_for_claude": "When Claude Code returns, re-run the adjudication review against books-audit/raw-extraction.json and this inventory before the real V5 build."
    },
    "inventory": draft["inventory"],
    "review": draft["review"],
    "cover_assets": draft["cover_assets"],
}

owner_review = {
    "generated": final["generated"],
    "note": "Internal list for the owner only. Nothing here appears in the public Books list. Duplicates are never listed; the owner picks one version and the winner is listed then.",
    "items": [
        {"id": "review-01", "group": "kahf", "question": "Which Kahf version to keep?",
         "detail": "Three successive versions of إضاءات من سورة الكهف — الجزء الأول: 126 pp (sent Nov 16), 135 pp (Nov 18), 138 pp (Nov 19). Likely the latest (138 pp) is the fullest, but only the owner / the Sheikh can confirm.",
         "files": ["kahf-khutbas-____-3.pdf", "kahf-khutbas-____-2.pdf", "kahf-khutbas-____.pdf"],
         "rule_fired": "normalized Arabic title match", "recommendation": "Keep the 138 pp Nov 19 version unless the Sheikh says otherwise"},
        {"id": "review-02", "group": "infidelity", "question": "Which infidelity version to keep?",
         "detail": "Two versions of الخيانة الزوجية وسبل التعامل معها: 16 pp (sent Nov 7) and 17 pp (sent Nov 17).",
         "files": ["-_____.pdf", "_______-_______-____-_______-____-____.pdf"],
         "rule_fired": "normalized Arabic title match", "recommendation": "Keep the 17 pp Nov 17 version unless the Sheikh says otherwise"},
        {"id": "review-03", "group": "phd-docx", "question": "List the PhD manuscript as a second format?",
         "detail": "The 819-page DOCX is the source manuscript of the same PhD book already listed in 4 parts (1,057 pp). It is the same work, not a separate book.",
         "files": ["______________________________________________.docx"],
         "rule_fired": "same work, different format", "recommendation": "Attach as a downloadable source-manuscript format on the PhD entry; do not list separately"},
        {"id": "review-04", "group": "newsletters", "question": "What to do with the Noor Sprouts newsletters?",
         "detail": "Two English issues + one Arabic issue of the Noor Sprouts parenting newsletter. These are the owner's own project, not the Sheikh's books.",
         "files": ["Noor-Sprouts-Newsletter-01-EN.pdf", "Noor-Sprouts-Newsletter-02-EN.pdf", "_______-________-02-_______-____-_____.pdf"],
         "rule_fired": "authorship", "recommendation": "Exclude from the Sheikh's Books list; owner decides whether they belong anywhere in the library and under what credit"},
        {"id": "review-05", "group": "proud-authorship", "question": "Who wrote Proud To Be Muslims #16?",
         "detail": "The file (10 pp, English, series #16) states no author anywhere. It is listed with the author omitted rather than guessed.",
         "files": ["_16-_Series_of_-Proud_To_Be_Muslims-.pdf"],
         "rule_fired": "authorship unconfirmed", "recommendation": "Confirm with the Sheikh whether it is his; credit him only if confirmed"},
    ],
}

with open(HERE / "books-inventory.json", "w", encoding="utf-8") as f:
    json.dump(final, f, ensure_ascii=False, indent=1)
with open(HERE / "owner-review-list.json", "w", encoding="utf-8") as f:
    json.dump(owner_review, f, ensure_ascii=False, indent=1)
print(f"books-inventory.json: {final['counts']}")
print(f"owner-review-list.json: {len(owner_review['items'])} items")
