# V5 PROTOTYPE — Track 3: Books section + dedup (DeepSeek)

Prototype built while Claude Code is capped (resets 11:10 PM PST Nov 20, 2026).
If it works, Claude missed out; if not, Claude fixes the details later.
Work dir: `~/workspace/archive-rebuild/v5-prototype/` (this folder).
NEVER touch `~/workspace/archive-rebuild/v5/` (Claude's build dir),
`~/workspace/archive-rebuild/v4/`, or any media files.

## What this track built (item 4 + DEDUP RULE)

- `books-audit/extract-books.py` — replayable extraction: page counts,
  PDF metadata, first-page title lines for all 52 book-candidate files.
- `books-audit/raw-extraction.json` — the raw extraction (52 files, 0 errors).
- `books-audit/dedup-check.py` + `dedup-mechanical.json` — deterministic
  dedup check (normalized Arabic titles, file names). Mechanical result:
  one filename-title group (the 3 Kahf versions); all other groups are
  multi-part works, parallel editions, or shared first-page lines.
- `books-audit/call-deepseek-adjudicate.py` + `deepseek-adjudication-raw.json`
  — DeepSeek (v4-pro) adjudication attempt: BURNED OUT (30,000 reasoning
  tokens, finish_reason=length, empty content). Two further review attempts
  also burned out (v4-pro 30000, flash 8000). DeepSeek is recorded SILENT;
  one finding was recovered from the flash partial trace (Arabic sort ignores
  the definite article ال) and adopted after independent verification. See
  `TEST-RESULTS.md` and `books-audit/books-inventory.json` → `review_status`.
  Book metadata only; no private data sent.
- `books-audit/books-inventory.json` — the public Books list: **38 entries**
  (metadata only). `books-audit/owner-review-list.json` — **5 items** for the
  owner (Kahf keep-which, infidelity keep-which, PhD DOCX as second format,
  Noor Sprouts newsletters, Proud #16 authorship). Nothing on this list
  ships until he rules on it.
- `books-data.js` — the inventory as a JS module for the app (same data
  as books-inventory.json, no binaries; public blurbs only, internal notes
  stay in the inventory JSON).
- `books.html` — the Books prototype page: list view (series-card grid,
  cover or khatam emblem, Arabic title, English title if supplied, language
  badge, page count; language filter only) → detail view → native PDF reader
  with "Open file" fallback. Hidden until at least one approved book with a
  readable file exists; no 6th nav item. Follows design verdict D15/D29 and
  the v4 tokens (.scard, .arch, .btn 44px, gold #C9A227, Amiri + Noto Sans
  Arabic, 390px single column). `books.css` + `books-app.js` are shared by
  both flavours.
- `books/files/` — SYMLINKS to `v5/books-from-sheikh/` (52 files: 48 under
  `books/` + 4 Anta Tasalu files at the staging root). One copy only; the
  prototype never duplicates book binaries.
- `books/covers/` — front-cover crops of the two Anta Tasalu wraparound
  covers (rendered from the supplied cover PDFs, 150 dpi). All other books
  use the khatam emblem (no placeholder art).
- `books-preview.html` — metadata-only preview flavour (banner: "نسخة
  معاينة: البيانات فقط، دون ملفات الكتب." / "Preview copy: metadata only, no
  book files."). No cover images, no file links, no reader. Never carries
  binaries.
- `TEST-RESULTS.md` — honest verification record for this track (37/37 CDP
  checks pass, zero external requests, 43/43 served files 200).
- `DECISIONS.md` — decisions taken and what is left for Claude's fix pass.

## Verified page counts

- All 46 PDFs: pypdf counts, matching the WhatsApp transcript send records.
- PhD DOCX: 819 pages (docProps/app.xml, matches transcript).
- Marital-issues DOCX: 32 pages (LibreOffice render).
- LibreOffice conversion of the 237k-word PhD DOCX is too slow to be useful
  (killed at 280 s); app.xml count stands verified.

## Run the prototype

```sh
cd ~/workspace/archive-rebuild/v5-prototype
python3 -m http.server 8901
# open http://localhost:8901/books.html
```

Book files resolve through `books/files/` symlinks; the reader opens the
real file in the browser's native PDF viewer. No network needed.
