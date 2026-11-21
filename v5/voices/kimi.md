# Kimi voice: V5 review of the Sheikh Moustafa Kamel offline video library

Provenance: answer obtained live from Kimi via the custom.kimi connector (model kimi-k2.7-code, temperature exactly 1) on 2026-11-20. Usage: 2,792 prompt tokens, 8,391 completion tokens (5,241 reasoning), finish_reason stop. Approximate cost $0.04 at kimi-k2.7-code rates ($0.95 in / $4.00 out per 1M tokens). The text below is Kimi's answer verbatim; nothing was added or edited except this header.

---

(1) Design for requirement 1: dual playback

Video identity rule in v4: every catalog id is the YouTube video ID, so `https://www.youtube.com/watch?v=<VIDEO_ID>` is derivable from existing data with no new fields and no network call at build or runtime.

Core pattern

- One primary action per surface, as in v4 cards.
- YouTube is always a secondary, honest external link.
- No prefetch, no embed, no thumbnail fetch, no `navigator.onLine` gating.
- Use a plain `<a>` with `href="https://www.youtube.com/watch?v=<VIDEO_ID>"`, `target="_blank"`, `rel="noopener"`.
- If the machine has no internet, the browser shows its own offline page; the app must not promise YouTube works offline.

Labels

- Arabic UI: `شاهد على يوتيوب`.
- English UI: `Watch on YouTube`.
- Screen reader text: Arabic `يفتح يوتيوب في المتصفح`, English `opens YouTube in your browser`.

Placement by surface

Lesson page

- Existing primary action stays local Play/Resume.
- Add a secondary text button next to Save and Mark as watched: `شاهد على يوتيوب` / `Watch on YouTube`.
- When the local file is missing, the existing 404 empty state becomes the page content. Make `شاهد على يوتيوب` the primary action there, with Back to series as secondary.
- In the format-failure state, add `شاهد على يوتيوب` beside `Open in another player`.
- If the whole `videos/` folder is missing, show the existing calm banner plus the same YouTube action.

Series cards, search results, Saved, Continue Watching, Where to Start first-lesson card

- Card primary action remains open local lesson page.
- Add a trailing icon-only link, 44 x 44 dp, using an external-link icon.
- Label it with the full `شاهد على يوتيوب` / `Watch on YouTube` text via `aria-label`.
- Do not make the card title itself open YouTube; that would break the one-primary-action rule.

Playlist rows / series sidebar

- Row click continues to open the local lesson.
- Add the same trailing external-link icon with the YouTube `href`.
- Keep the row height and tap target unchanged.

Missing-vs-present behavior

- On cards, always show the link. Do not HEAD-check every card at render time for performance reasons.
- On the lesson page, if the local file is absent, surface the YouTube link as the primary recovery action.
- If present, local playback is primary and YouTube is secondary.
- Never disable the YouTube link when offline; instead, rely on the browser to fail gracefully.

(2) Design for requirement 2: books section

Where it lives

- Add a top-level nav item: `الكتب` / `Books`, placed after Library in the fixed RTL chrome.

List view

- Use the existing series-card grid pattern: cover thumbnail, Arabic title, English title if supplied, language badge, page count.
- Lazy thumbnails with `loading="lazy"` and `decoding="async"`.
- Sort by owner-provided order, then Arabic title.
- Filter by language only; do not force books into pillars unless the owner explicitly maps them.

Detail view

- Larger cover, metadata block, description, Read button.
- Read button opens the PDF in the browser's native viewer inside a full-screen overlay/iframe with a back button.

Offline reading

- Books live in an installed `books/` folder, not inside the 7.8 MB single-file preview.
- In the preview flavor, list book metadata and show a note: `متاح في التطبيق المثبت` / `Available in the installed app`.
- Use the browser native PDF viewer via `<iframe src="books/<filename>.pdf">` or `<object>`. This avoids new dependencies.
- EPUB is not supported natively; defer it. If a book is only supplied as EPUB, convert to PDF or ship without it.

Search

- Global search indexes book titles and metadata only.
- Full-text search requires the owner to supply an extracted text file per book; no AI OCR.

Saved / Where to Start

- Do not extend Saved to books in v5; keep Saved video-only to limit scope.
- Do not put books on Where to Start; that path is built from verified video curriculum data.

Exact owner inputs needed

1. Format decision: PDF required, EPUB deferred, scanned PDF accepted.
2. Per book:
   - Arabic title (required).
   - English title if available.
   - PDF filename.
   - Cover image filename (JPEG/WebP, ideally <= 200 KB).
   - Language(s).
   - Year (optional).
   - Short description (optional).
   - Category or pillar mapping (optional; default to none).
   - Ordering index.
   - Scan flag: true if the PDF is image-only.
   - Optional plain-text/OCR file if full-text search is wanted.
3. Authorship confirmation for each title and permission to distribute offline.
4. Global section settings: title, default sort, whether to include in global search, whether to allow pillar filtering.
5. If a book is not authored by Sheikh Moustafa Kamel, note the actual author and do not invent it.

(3) Design for requirement 3: About the Sheikh page

What v4 already verifies

- The Sheikh tab already shows: calligraphic monogram, full Arabic name, `Sheikh Dr. Moustafa Kamel`, a role line, archive-derived stats (lessons, series, years of publishing, hours, languages), and an index of his series in this library.
- Those stats are derived from the catalog and follow app DATA counts.

What can stay from the archive itself

- Name as it appears in the catalog and channel metadata.
- Title/role line only if it already appears in verified channel metadata; otherwise keep the role line generic or omit it.
- Archive-derived stats and series index.
- Book list, once books are added and authorship is confirmed.

What must stay unknown or blank until supplied

- Birth date and place.
- Upbringing, education history, institutions.
- Teachers and ijazat.
- Official positions, awards, family details.
- Any biography narrative beyond what the Sheikh's team explicitly approves.

What to ask the Sheikh's team for

1. An approved, final biography paragraph or two, with permission to publish.
2. A verified list of teachers and ijazat, or explicit instruction to omit them.
3. Verified academic credentials and institutions, if any are to be shown.
4. A preferred portrait photo, or confirmation to keep the monogram.
5. Preferred subtitle/role line beyond `Sheikh Dr. Moustafa Kamel`.

Page layout

- With no biography: keep the current monogram, name, role line, stats, series index, and book list. Do not add a Biography heading.
- With biography supplied: same top block, then a `السيرة` / `Biography` section containing only the approved text, then series index and book list.

Guard against placeholder language

- The biography data field must be either `null` or a final approved string.
- Build guard: reject any string containing `awaiting`, `TBD`, `draft`, `placeholder`, or `تحت المراجعة`. If rejected, the field is treated as `null` and the section is omitted.
- The shipped screen must never show "awaiting confirmation" or any draft wording.

(4) Additional improvements and additions, ranked

1. Resolve NEEDS-OWNER-REVIEW playlists and reconcile DATA-vs-TSV counts. Score: 5.
   - What: owner decides pillar/level/exclusion for the 7 unresolved playlists; reconcile the 4,320 app DATA memberships against the 4,332 TSV rows.
   - Where: Library pillar grouping, Where to Start, curriculum paths, all on-screen counts.
   - Why: v5 numbers must be internally consistent; unresolved playlists block correct curriculum design.
   - Acceptance: final owner decisions documented; on-screen counts match a single reconciled source; excluded playlists remain browsable in Library.

2. Pre-ship verification matrix for all unverified v4 items. Score: 5.
   - What: test real MKV playback on the target laptop, Windows .bat and macOS .command launchers, Safari and Firefox, recitation overlap with real audio output, hosted flavor over HTTPS, all 65 screenshots by eye, native Arabic copy review.
   - Where: QA run before v5 ships.
   - Why: v4 was verified only in headless Chromium; playback and launchers are core to the product.
   - Acceptance: signed-off checklist; critical issues fixed or documented as known limitations.

3. Accessibility pass. Score: 5.
   - What: keyboard focus order across RTL nav, rails, grids, and player; visible focus rings; `aria-label` on Save, YouTube, Mark as watched, and pillar chips; `prefers-reduced-motion` guard; contrast audit; touch targets >= 44 x 44 dp; screen-reader heading hierarchy.
   - Where: all screens.
   - Why: 4,000 items plus RTL plus dual-playback buttons raise real accessibility risk.
   - Acceptance: manual or axe audit with zero critical errors; focus order matches visual flow; reduced-motion disables View Transitions and hero motion.

4. Fix known v4 audit leftovers. Score: 4.
   - What: remove duplicate Library sidebar rows (`All lessons 3,977` vs `Lectures 3,973`) into one row; fix mobile pillar-card meta wrapping; add match-field labels on search results (title/series/pillar); stabilize search heading state; add recent searches from localStorage.
   - Where: Library and Search.
   - Why: these are visible polish defects that hurt trust and discovery.
   - Acceptance: one clean "All lessons" row; metadata does not wrap awkwardly; search results show why they matched; heading updates correctly; recent searches persist offline.

5. Enforce the 1,500-card soft cap with Show more. Score: 4.
   - What: cap rendered cards in all-videos and large pillar views; keep existing chunked rendering.
   - Where: Library grids.
   - Why: prior research note and 4,000 videos risk unbounded DOM growth.
   - Acceptance: largest view renders no more than 1,500 cards initially; Show more loads the next chunk without full re-render; no jank on a low-end laptop.

6. Cross-link near-duplicate series with See also. Score: 3.
   - What: owner approves pairs such as `سلسلة الأخلاق` / `سلسلة مكارم الأخلاق`, `فقه المعاملات 2023` / `سلسلة فقه المعاملات`, etc.; add See also links on series and lesson pages.
   - Where: series detail and lesson sidebar.
   - Why: improves discovery without forcing a data merge the owner has not decided on.
   - Acceptance: approved pairs documented in data; links render from data; no invented relationships.

7. Arabic grammar sub-track inside Deeper Sciences. Score: 3.
   - What: curate the grammar/i`rab component from the three-juz memorization program into a labeled sub-track card.
   - Where: Library, Deeper Sciences pillar.
   - Why: the catalog has no dedicated grammar series, but classical curriculum order expects one.
   - Acceptance: owner verifies included lessons; sub-track appears as a card with accurate counts from app DATA.

8. Recently-added rail on Home. Score: 2.
   - What: derive the 12 most recent videos by catalog date and add a rail below Continue Watching.
   - Where: Home.
   - Why: open part notes the missing surface; low cost.
   - Acceptance: rail renders 12 items; chunked/lazy; click opens lesson; no external fetch.

(5) Risks and what to verify before building

- Real MKV playback may fail on the owner's laptop depending on codecs and browser; verify with actual files before shipping.
- Windows .bat and macOS .command launchers were never run; verify path quoting, Python detection, and working directory.
- Safari and Firefox were never tested; verify View Transitions fallback, native PDF viewer, MKV support, and RTL focus order.
- Recitation overlap with real lesson audio was never heard; verify play/pause/stop behavior on real speakers.
- YouTube links on offline machines will fail in the browser; ensure copy is honest and the app does not imply YouTube is offline.
- Books PDFs can bloat the installer; verify total size and exclude binaries from the preview.
- Scanned PDFs are not searchable; set user expectations explicitly and do not promise in-app text search.
- DATA-vs-TSV discrepancy can produce wrong counts and paths; reconcile before any derived number is treated as final.
- The 7 NEEDS-OWNER-REVIEW playlists block curriculum decisions; owner must decide before Where to Start is finalized.
- Native Arabic copy review is still owed; verify all new labels, including `شاهد على يوتيوب` and `الكتب`.
- Browser native PDF viewers behave differently and may not render offline consistently; test in Chrome, Safari, Firefox with a local file.
- Accessibility focus order in RTL grids with icon buttons is easy to get wrong; verify with keyboard and screen reader.

(6) Explicitly NOT do, and why

- Do not embed YouTube iframes, fetch YouTube thumbnails, or call any YouTube API: violates offline-first and zero external requests at runtime.
- Do not implement an in-app browser for YouTube; it must open the system browser as an explicit user-initiated link out.
- Do not use AI to write biography, OCR books, generate audio, or translate labels; violates the no-AI rule and the verified-facts rule.
- Do not ship placeholder, draft, or "awaiting confirmation" text on The Sheikh page; the standing rule is specific verified facts or silence.
- Do not add a section for other scholars; only Sheikh Moustafa Kamel is prominent.
- Do not bundle book binary files into the single-file preview; it would blow the 7.8 MB assumption and is unnecessary for a preview.
- Do not use paid PDF/EPUB SDKs, cloud document viewers, or third-party clouds; the vetted-playbook excludes them.
- Do not add ratings, comments, social sharing, analytics, purchases, subscriptions, or API keys.
- Do not swap the bundled CC0 recitation or add AI-generated recitation.
- Do not hide or disable YouTube links based on `navigator.onLine`; that would imply the app manages YouTube connectivity and is unreliable.
- Do not add speculative features such as AI recommendations, auto-transcription, cloud sync, or machine translation.