# Books adjudication check — VERDICT (mechanical re-run)

Re-ran `books-audit/adjudication-check.py` Nov 21, 2026 ~06:41 UTC. It
rewrote `adjudication-check-results.json` with the same structure, so the
JSON is now VERIFIED as reproducible output of the script — no longer
unverified partial output. No verdict report existed; this file is it.

## Verdicts (8 checks)

- PASS: `1_accounting` — 52 files: 41 listed + 9 review + 2 covers.
- PASS: `4_anta_counts` — Anta Tas'alu volume counts.
- PASS: `6_owner_review_excluded` — owner-review items excluded from counts.
- PASS: `7_books_data_js` — `books-data.js` matches the inventory.
- PASS: `8_author` — author attribution.
- FLAG: `2_pages` — book-31 (DOCX) has no page count in raw extraction;
  inventory claims 32 pp. Track 3 notes record a LibreOffice render as
  evidence for the 32 pp, but the check script cannot see it. Needs the
  evidence linked, not a data change.
- FLAG: `3_titles` — book-03 / book-04: the English title
  "Anta Tasalu wa al-Shaikhu Yujib" (a transliteration) is not found in
  the files' first-page title block / metadata / filename. The Arabic
  title is on the page. Transliteration-vs-source nuance, not a missing
  book.
- FLAG: `5_sort` — Arabic block order differs from the ال-ignored
  dictionary order in a few spots (book-37 placement; book-26/27 and
  book-34/35 swaps). Sort-rule nuance, not a data error.

## Bottom line

None of the 3 FLAGs blocks the build or the Books UI; they are metadata
nuances for Track 3 / owner review. This mechanical check does NOT
replace the DeepSeek LLM adjudication review, which remains uncompleted
(3 burnouts, recorded as silent).
