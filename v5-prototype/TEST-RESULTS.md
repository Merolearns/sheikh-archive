# Track 3 — Books section + dedup: test results (prototype)

Date: 2026-11-21 (UTC). Server: `python3 -m http.server 8901` from
`v5-prototype/`. Browser: headless Chromium 159 (Playwright cache), CDP driver
`/tmp/cdp-books-test.py` (37 assertions) + `--dump-dom` + screenshots.

## HTTP / file serving — PASS (after one fix)

- `books.html`, `books-preview.html`, `books-data.js`, `books.css`,
  `books-app.js`, fonts, ornament, covers: all 200.
- All 43 served book files (41 book files + 2 cover JPGs) return 200.
- **Fix made during testing:** the 4 Anta Tasalu symlinks were missing from
  `books/files/` (the 48 links only covered the 46 PDF + 2 DOCX under
  `books/`; the Anta files live at the staging root). `books/files/Part1_Interior_256pp.pdf`
  returned 404. Created 4 symlinks (2 interiors + 2 wraparound covers) to
  `v5/books-from-sheikh/*.pdf`. Re-checked: 43/43 served files 200, 0 failures.

## CDP interaction tests — 37/37 PASS (final run)

- List renders 38 cards; AR count shows `٣٨ كتابًا`; chips ar=34 en=4.
- Cover images present for the 2 Anta volumes only; all other cards use the
  khatam emblem (`.arch.noimg`).
- EN toggle: h1 becomes `Books`, count `38 books`; toggle back to AR works.
- Filter EN shows 4 cards; filter All restores 38.
- Search `رمضان` → 1 card; search `السيرة` → 5 cards (2 Seerah AR + 2 Seerah
  EN, which carry the Arabic title, + 1 khutba collection); search `zzzz` →
  empty state.
- Detail PhD: 4 part rows, total `١٬٠٥٧` pages, blurb present.
- Detail Anta v1: cover image, volume label `الجزء الأول`, blurb `٤٠٥`.
- Detail Fatiha AR: companion link to book-37 (English edition).
- Reader PDF: iframe present, src is the Anta interior, Open file link present.
- Reader PhD part 3 (`#/book-01/read/2`): iframe src is the part-3 file.
- Reader DOCX (`#/book-31/read`): word-note shown, no iframe, Open file link.
- Zero console errors on list, after all views, and on preview.
- Preview flavour: 38 cards, 0 cover images, no `books/files` string anywhere
  in the DOM, banner present, detail has no Read button, reader route
  redirects to detail (no iframe).

## Visual — eyeballed, PASS

- `books-list-1280.png`: emerald theme, gold accents, arch cards, real Anta
  covers, Amiri titles, badges, 44px buttons. Order right-to-left: PhD,
  Fatiha, Anta v2, Anta v1.
- `books-list-390.png`: clean single column, no overflow, buttons full width.
- `books-detail-1280.png`: cover, title, author, badges, volume label, blurb,
  Read button.
- `books-preview-1280.png`: banner, khatam emblem in place of the cover, no
  Read button.

## Zero external requests — PASS

- `grep` over `books.html`, `books-preview.html`, `books.css`,
  `books-app.js`, `books-data.js` for `http://`, `https://`, `//cdn`,
  `@import`, remote `url(`: 0 matches.
- Server access log for the whole CDP run: only local paths (fonts, CSS/JS,
  covers, book PDFs via the reader iframe). No external hosts.

## Inventory / dedup verification — PASS (mechanical)

- 52/52 source files accounted exactly once: 38 listed entries + 4 review
  groups covering 9 files + 2 cover PDFs. 0 duplicates in the public list.
- Titles checked against each file's first-page title block; page counts
  against pypdf / app.xml / LibreOffice; groupings against the WhatsApp
  transcript send records and MANIFEST byte sizes.
- Mechanical dedup (`dedup-check.py`): exactly one filename-title group —
  the three Kahf versions. Confirmed by hand: infidelity pair, PhD DOCX.
- Arabic sort verified by eye as standard dictionary order (definite article
  ال ignored): الأخلاق، الأسرة، الأنبياء، أول العام، الإيمان، تزكية، الحج،
  الحديث، الدعوة، رجب، رمضان، سبعة، السيرة، شعبان، الصحابة، العبادات،
  قضايا، المجتمع، الموت، الهجرة.

## DeepSeek adjudication review — SILENT (gap, not agreement)

- Attempt 1, v4-pro generation, `--max-tokens 30000`: 41,553 tokens, all
  30,000 completion tokens spent on reasoning, `finish_reason=length`,
  content empty.
- Attempt 2, v4-pro review of the draft, 30000: 44,689 tokens, same burnout.
- Attempt 3, flash (default model) review, 8000: 22,636 tokens, same burnout
  (the flash endpoint also spends its budget on reasoning tokens).
- One usable finding recovered from attempt 3's partial trace (Arabic sort
  must ignore ال): verified independently against standard Arabic
  alphabetization and adopted. No verdict JSON was ever returned.
- Balance after the three calls: $40.06 (was $53.23 on Nov 12; the rest of
  the drop is other team usage, not these calls).
- Per the DeepSeek skill: the missing voice is carried as a gap. The
  inventory's correctness rests on the mechanical triple-check above.
  **Claude's fix pass must re-run the adjudication review** against
  `books-audit/raw-extraction.json` and `books-inventory.json`.

## Known issues / left for Claude's fix pass

1. Adjudication review never completed (see above) — re-run it.
2. Detail view: the English subtitle line sits at the far left of the text
   column (correct LTR-in-RTL rendering, looks slightly detached). Cosmetic.
3. Books hidden-until-approved gate (brief: hidden until ≥1 approved book
   with file exists) belongs in the real app shell, not this standalone page.
4. `books.html` / `books-preview.html` are two thin shells sharing
   `books.css` / `books-app.js`; the real build should fold the preview flag
   into the app's build flavours instead of two files.
5. Owner decisions open (see `books-audit/owner-review-list.json`, 5 items):
   Kahf keep-which, infidelity keep-which, PhD DOCX as second format,
   Noor Sprouts newsletters, Proud #16 authorship.
6. Reader has no missing-file detection beyond the always-visible Open file
   fallback (iframe load failure is not observable cross-browser); the real
   build should add a HEAD check where the app shell can do it.
7. Search is a substring filter over titles/authors/blurbs only (per brief:
   book titles/metadata only). No search synonyms (deferred by council).
