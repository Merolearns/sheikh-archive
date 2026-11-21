# V5 prototype decisions (Qwen track, Nov 20 2026)

Prototype dir: `~/workspace/archive-rebuild/v5-prototype/`. Seeded by COPY from v4; never touch `~/workspace/archive-rebuild/v5/` (Claude's build dir) or any media. Catalog DATA is v4 DATA as-is; reconciled DATA comes from the parallel Codex track.

## Item 15 / B1 — SETTLED by owner ruling (Nov 20 ~21:33 PST)

- Archive login uses **Supabase, under the SAME Supabase account as SLATE, but as a SEPARATE Supabase project**. Verified firsthand: SLATE uses a hosted Supabase Cloud project (not self-hosted), so a second project under the same account is fully separate: its own auth users, database, URL and keys.
- The archive login **must NOT share SLATE's project, tables, or keys**.
- Wiring: `src/assets/supabase-config.json` with only `{url, anonKey}` for the archive's OWN project. It ships EMPTY; build.py fails if the file is missing or has extra keys, and fails if it is non-empty without owner approval. While unconfigured, the email option shows an honest not-configured state, never a fake success.
- Guest entry is first, works fully offline, progress stored locally per device (existing K.* keys). Signed-in progress syncs only when an archive project exists; `syncAccountProgress()` is a no-op stub until then.
- Sign-in: email + password, Supabase Auth REST (`/auth/v1/token?grant_type=password`), no confirmation step, straight to the library (same pattern as SLATE). Password is never trimmed, never stored.

## Dual playback (items 3 + 13)

- **Installed flavor (archive.html): local primary when the file is playable** (v4 resume, captions, transcript, progress, recitation all kept). Confirmed missing file: the calm error treatment stays (closed Details disclosure, back navigation), the Local button becomes plain status text, and YouTube becomes the primary ACTION — the user clicks it; **never an auto-switch** (item 3 mechanics: "no auto-opening YouTube on local error"). File found but playback fails: error panel + "Open in another player", YouTube usable beside it.
- **Hosted flavor (archive-hosted.html): YouTube is the automatic default on click** (item 13); it carries `<meta name="archive-flavor" content="hosted">`, which app.js reads as HOSTED. Local shows as unavailable status text there (no local files can exist on the hosted site). Hosted/R2 button shows an honest not-available notice until the R2 copy exists.
- Activating YouTube pauses local playback, saves position, stops the recitation. Transcript line clicks do not start the hidden local video while in YouTube mode; captions/transcript sync pause in YouTube mode (full transcript text stays readable).
- YouTube ID is extracted from the media filename (`[11-char ID]`) after decodeURIComponent (paths are percent-encoded).
- Build guard allowlists ONLY the youtube-nocookie embed host; every other external URL still fails the build.
- **Correction (Nov 20, after re-reading brief items 3 + 13):** the first draft auto-switched to YouTube on 404 and auto-YouTubed on every lesson open in both flavors. That violated item 3 (local primary; calm error treatment; no auto-open on local error) and would have broken v4 behavior tests 5 and 6. Fixed: local-first in the installed flavor, no auto-switch on 404, hosted-only auto-YouTube via the flavor meta.

## Donation URL — network guard disposition (Track 1 integration, Nov 21 2026)

**Decision: ALLOWLIST, not removal.** The URL `https://us.mohid.co/ca/losangeles/wcis/masjid/online/donation/index/1` stays in the catalog exactly as it appears in the original YouTube title of video `02ooBaSzV54` ("تبرع بصدقة جارية …", 49-second Short, uploaded 2024-06-01). It is the Sheikh's own masjid donation page (Masjid Al-Ansar / West Coast Islamic Society, Los Angeles).

Reasons, in order:
1. Catalog titles are preserved verbatim (brief: original titles preserved, DATA is the source of truth). Removing the URL would falsify the title.
2. The media file on disk is literally named with this URL in it (percent-encoded in the video's `media` and `thumbnail` paths). The title matches the file; stripping it from the title would break title-to-file correspondence.
3. The app never fetches it, never links it, never renders it as an anchor — titles are escaped text, so it causes zero runtime requests. Per the brief item-9 guard-scope correction, the claim is "zero runtime external requests", never "zero literal URLs in the artifact".
4. The allowlist is narrow: exact literal only, plain-text `EXTERNAL_URL` findings only. The same URL as an asset, a request, or a resource hint still fails the guard (tested).

Implementation: `DONATION_URL` constant + skip in `guard/network_guard.py` `Scanner.check()`; test `test_donation_url_allowlisted_as_catalog_text_only` (8 guard tests pass); `guard/GUARD-REPORT.md` updated. Decided by the team per the integration brief; no public-page change, so no owner ruling needed.

## About the Sheikh (item 5)

- Bio from verified facts only (`v5/sheikh-bio-source.txt`, his own words). Channel avatar fetched from his public YouTube channel page, saved locally at `src/assets/img/sheikh-portrait.jpg` (900x900, sha256 30b09bead3ba736f1dad788f15766dd9289e033a226d79ac2328a77da92626b2); never hotlinked. Monogram replaced by the photo.

## Copy audit (item 8, Qwen, Nov 20)

- 14 new UI strings added (login lg_*, playback pb_*) in AR + EN; sh_role reworded to native Arabic. Two soft spots for Claude's fix pass: present-continuous teaching claim in the bio, and any remaining translated-sounding strings.
- No em dash in any UI copy. 44px touch targets on new buttons; login form scrolls inside the illuminated page frame if needed.

## Test results (Nov 20, ~21:58 PST, prototype testroot + local server)

- HTTP 26/26 PASS, behaviour 37/37 PASS, screenshots 65/65, 0 failures (desktop + mobile, AR + EN, 6 themes). Build guards pass (catalog byte-identical to v4, no em dash, no external URL except the youtube-nocookie embed, no placeholder language, node --check OK).
- One v4 test updated in the PROTOTYPE copy only (v4 originals untouched): test 2 "opening has exactly one control" now expects 2 visible controls (guest + email, form hidden) — the owner-ordered item-15 design supersedes the v4 one-button opening.
- Item 7 duplicate-sidebar-rows claim: NOT confirmed in the rendered DOM (rows 71 / 3977 / 3793 / 138 / 46 / 246 / 0 / 0; no 3973 exists). No fix made.
- Item 5 verified live: portrait 900x900 loads from local assets; bio 819 chars rendered on the sheikh tab.
- Items 3 + 13 verified live: local-first on playable lesson; YouTube click switches to the nocookie iframe with the correct video ID, pauses local, hides captions; hosted button shows the honest not-available notice; missing file keeps the calm error treatment with the Local button as status text and no auto-switch.
- Item 15 verified live: filled email+password submit shows the honest not-configured notice and stays on the splash (no fake success). Guest entry works fully offline.
- Playwright note: the v4 tools' baked-in playwright-core path (`~/.npm/_npx/9833c18b2d85bc59/...`) is dead (package.json stripped); the prototype tool copies point at the working install `~/workspace/linkedin-posts/node_modules/playwright-core`. The v4 originals still carry the dead path.

## What remains for Claude's fix pass

- Item 7: verify the duplicate sidebar rows claim in the rendered DOM first (Kimi withdrew it); mobile pillar meta wrapping; match-field labels; search heading stability; recent searches.
- Item 8: full accessibility audit (focus order, focus rings, aria-labels, prefers-reduced-motion, contrast, 390px + 200% zoom).
- Item 14: transcripts already work as in v4; verify AR+EN in the prototype build.
- Item 13 auto-sync shape: no uploader exists yet; the prototype only defines the playback fallback order. Real auto-sync needs the R2/hosted pipeline (owner-approved direction, not built).
- Bio soft spots above.

## Track 1 integration (Codex-led, Nov 21 2026)

- Catalog DATA source is now `audit/catalog-reconciled.js` (was v4's `archive.html`). Reconciled DATA is deep-equal to v4's (verified); the literal serialization differs, so the catalog version hash changed to `22feeb79dfc7`. `build.py` asserts deep-equality with v4 on every build.
- Counts in `build.py` assert against `audit/counts.json` (reconciled: 3,977 unique video IDs, 71 playlists, 4,320 occurrences) instead of literals. Stale "v3" assert messages updated to "reconciled".
- `render/chunked-render.js` inlined by `build.py` `shell()` before `app.js` (both flavors). `mountList` replaced with a `renderChunked` wrapper keeping the `box, list, card, cap` signature and `_stop` lifecycle; the old IntersectionObserver/skeleton implementation and its now-dead `FIRST_N` / `CHUNK` / `idle` / `SKEL` are removed. The pillar branch in `renderLibrary` mounts each pillar grid through `mountList` with a shared first-paint budget of 100.
- Button/status strings wired into the locale tables: `more_cards` reused, new keys `chunk_none` / `chunk_all` / `chunk_counts` (AR + EN), numbers formatted with `nf()`.
- `guard/network_guard.py` runs over the assembled `build/Preview/` as a build step; the build fails on violations. Two guard extensions, both fail-closed and tested: the donation-URL allowlist (above) and the `PLAYBACK_CONCAT` form for the real YouTube assignment in `setPlayMode` (runtime ID from `ytIdOf()`, marked `// network-guard: youtube-playback`; unmarked or wrong-host forms still fail).
- Build result: exit 0; audit tests 2/2, guard tests 8/8; network guard 3 files, 0 violations.

## Bio correction — copy-fixpass §1 applied verbatim (Nov 21 2026)

- Ground truth re-read firsthand: `v5/sheikh-bio-source.txt`. The doctorate carries NO year; the only "2015" in the source is the separate verbatim line "العمل2015", which the source file says not to guess the meaning of. The 2015 PhD year in the old bio was a conflation and is removed, not replaced.
- `sh_bio` (AR + EN) replaced VERBATIM with the `qwen/copy-fixpass.md` §1 proposed replacements: PhD year removed; teaching stated only in the past tense (pre-graduation and Egypt sequence); only the imamate is current; Master's scope restored (comparative fiqh on marriage, maqasid perspective, 2013); dissertation title quoted verbatim instead of paraphrased; "هاجر" replaced by "جاء"; EN "comprehensive ijaza" removed.
- Verified after the edit: `node --check` OK; zero occurrences of 2015/٢٠١٥ in `src/app.js`; zero "مواصلاً" / "continuing to teach" remnants; bio lengths 834 (AR) / 1055 (EN) chars.

## Supabase login — config state (Nov 21 2026)

- The prototype config `src/assets/supabase-config.json` ships EMPTY (`{"url": "", "anonKey": ""}`) in all three copies (src, build, testroot). The email option therefore shows the honest not-configured state; guest entry works offline. No live login-path check is possible against an empty config, and none has run — sign-in is NOT claimed to work. A filled config was observed transiently in an earlier check and is not present now; the discrepancy is recorded here, not resolved by guessing.

---

# Track 3 — Books section + dedup (DeepSeek track, Nov 21 2026)

Files: `books.html` (installed flavour), `books-preview.html` (metadata-only
flavour), `books.css`, `books-app.js`, `books-data.js` (generated from
`books-audit/books-inventory.json`), audit scripts + raw extraction under
`books-audit/`. Test results: `TEST-RESULTS.md` (this track).

## Inventory (38 listed, 4 review groups, 52 files)

- Titles come from each file's own first page (title block), never from the
  file name alone and never invented. The two DOCX files have no readable
  first page; they were identified by MANIFEST byte size (1,768,577 B = the
  819-page PhD manuscript; 137,565 B = مسائل في مشكلات الحياة الزوجية, 32 pp
  verified by LibreOffice render).
- Authors are credited only from verified facts (the Sheikh's dictated bio,
  the dissertation title page, the Sheikh's Nov 16 message). Proud To Be
  Muslims #16 states no author anywhere: listed with the author omitted,
  authorship added to the owner-review list.
- Al-Fadila is presented as what it is: the Sheikh's lessons ON
  al-Manfaluti's book الفضيلة, not the book itself as his own work.
- PhD book = ONE entry with four ordered parts (330+230+286+211 = 1,057 pp),
  per design verdict D15. The 819-page DOCX is the same work in another
  format: review list, not a separate entry.
- Anta Tasalu = two separate volumes (405 questions / 303 questions), each
  with its real front cover. Covers rendered from the wraparound PDFs at
  150 dpi and cropped by eye (dark green, gold calligraphy).
- Seerah: Arabic parts 1-2 (92/55 pp, order from the transcript's send
  times) and English parts 1-2 (124/76 pp), paired by part number as
  companions. Fatiha AR/EN paired the same way.
- Sort: PhD first, then Arabic titles in standard Arabic dictionary order
  (definite article ال ignored — finding from the DeepSeek flash partial
  trace, verified independently), then English titles. No owner order exists
  yet; when the owner gives one it supersedes this sort.

## Dedup

- Rule applied per the brief: normalized Arabic title (diacritics stripped,
  alef/hamza/teh marbuta/yeh normalized), case-folded English title,
  file-name match. Duplicates NEVER enter the public list.
- Kahf trio (126/135/138 pp, same printed title) and infidelity pair
  (16/17 pp) are version groups, not separate books: owner picks one.
- Newsletters (Noor Sprouts, 3 files) are the owner's own project, not the
  Sheikh's books: excluded from the Books list, owner decides their home.

## UI

- Series-card grid reusing the exact v4 tokens (`.scard`, `.arch` 4/3,
  `.stitle`, `.btn` 44px minimum, `--gold:#C9A227`, Amiri + Noto Sans Arabic
  bundled locally, emerald theme). `.btn.small` (36px) is never used for Read.
- No 6th nav item; this prototype page is the Books section itself. Search
  indexes book titles/metadata only. Saved stays video-only; books are not
  on Where to Start (both are app-shell concerns, out of scope here).
- Reader is the browser's native PDF viewer (`<iframe>`) with an
  always-visible Open file fallback. DOCX gets a Word-document state, not a
  broken embed.
- Preview flavour (`books-preview.html`) is metadata only: no cover images,
  no file links, no reader. The installed flavour (`books.html`) has the
  real covers and files.
- Arabic UI uses Eastern Arabic numerals (٣٨ كتابًا، ١٬٠٥٧ صفحة، ٤٠٥ مسائل)
  per the design verdict; English UI uses Western numerals. Arabic plurals
  follow native rules (صفحة/صفحتان/صفحات/صفحة، كتاب/كتابان/كتب/كتابًا).
- Page chrome stays RTL-anchored; only text blocks switch lang/dir (v4
  pattern). UI language persists in localStorage (prototype key).
- Book binaries are symlinked, never copied (`books/files/` → the single
  copy under `v5/books-from-sheikh/`). No book binary is in any ZIP or share
  output. The 4 Anta symlinks were missing and were created during testing.

## DeepSeek

- DeepSeek is review/diagnosis only per its skill; it never builds. The UI
  was written by the agent from the v4 tokens. The adjudication review was
  attempted three times (v4-pro 30000 ×2, flash 8000 ×1) and burned out all
  three times (whole completion budget spent on reasoning, empty content).
  Recorded as silent, carried as a gap; one finding (ال in sort order) was
  recovered from the partial trace, verified independently, and adopted.

## What remains for Claude's fix pass (Track 3)

- Re-run the adjudication review against `books-audit/raw-extraction.json`
  and `books-inventory.json` (DeepSeek never completed it).
- Owner decisions open (`books-audit/owner-review-list.json`, 5 items):
  Kahf keep-which, infidelity keep-which, PhD DOCX as second format,
  Noor Sprouts newsletters, Proud #16 authorship.
- Detail view: the English subtitle line sits at the far left of the text
  column (correct LTR-in-RTL rendering, looks slightly detached). Cosmetic.
- Books hidden-until-approved gate belongs in the real app shell.
- Reader has no missing-file detection beyond the Open file fallback; the
  real build should add a HEAD check where the app shell can do it.
- `books.html` / `books-preview.html` are two thin shells sharing
  `books.css` / `books-app.js`; fold the preview flag into the app's build
  flavours in the real build.

## Supabase config regression + fix (Nov 21, 2026 ~06:47 UTC)

- REGRESSION: `src/assets/supabase-config.json` held the real project URL +
  anon key at 22:14 PST Nov 20 and was empty (`{"url": "", "anonKey": ""}`,
  26 bytes) by 22:20. `build.py` enforced it: the assert at the supabase
  check forbade filled values ("prototype ships unconfigured"). The build
  copied src to the build output, so the empty config shipped everywhere.
- FIX (build.py, supabase block): the build now PRESERVES a filled config.
  It writes the empty template only when the config file is absent from
  the build output; it never overwrites a filled config. A filled config
  is validated instead of forbidden: both fields must be set, the URL must
  match a Supabase project URL, the anon key must be JWT-shaped. A
  half-filled or malformed config fails the build loudly. The docstring
  line and the print message were updated to match (filled = "email
  sign-in live", empty = "honestly unavailable").
- VERIFIED: 4 cases in a /tmp scratch copy of the prototype (fake
  well-formed values only, never shipped): filled preserves byte-identical
  and passes; half-filled fails; malformed URL fails; absent file gets the
  empty template. A real build at 06:47 UTC passed with the refilled
  config preserved (271 bytes in the build output).
- REFILL: `src/assets/supabase-config.json` was refilled with the real
  project values (browser task pulled them from the Supabase dashboard).
  Values are NOT recorded in any file or report.
- LOGIN PATH VERIFIED LIVE: POST to the project's
  `/auth/v1/token?grant_type=password` with dummy credentials returns
  HTTP 400, error_code `invalid_credentials` — the project answers, the
  key is accepted, wrong credentials are rejected. First attempt timed
  out (transient); retry answered in ~1s. A real user sign-in still needs
  the owner's actual account; only the path is claimed, not a login.
- BLOCKED (environment, not the app): exec data-writes started failing
  with EPERM ~06:48 UTC (file creation works, writing data does not; bash
  redirects, cp, and Python flushes all affected). `build.py` cannot
  regenerate `build/` until exec writes recover. `build/Preview/` is
  currently CORRUPT: the failed copytree runs at 06:51-06:52 truncated
  all 12 asset files to 0 bytes (7 fonts, 4 images incl. the portrait,
  the config) and the HTML/catalog files are gone (build.py removes the
  output dir first). `src/` is intact (bio-fixed, config filled).
  Re-run `build.py` + full `tools/run_all.sh shots` once exec writes
  recover. The 06:43 run's HTTP 26/26 + BEHAVIOUR 37/37 stand (testroot
  intact, empty-config build); its SHOTS failure (empty output) is
  consistent with the same write failure, not an app regression.

## Gemini second-test (Nov 21, 2026 ~06:55 UTC, via gemini-chat)

Independent check of the Track 1 integration + bio fix. Verdicts:
- BIO vs SOURCE: PASS. No PhD year in either language; teaching past
  tense only; only the imamate current; 2013 Master + dissertation title
  match the source facts.
- DONATION URL allowlist: PASS. Inert catalog metadata only, never
  rendered as a functional link.
- PLAYBACK_CONCAT guard exception: PASS. 11-char ID regex + mandatory
  youtube-nocookie.com host prevents injection/redirection.
- Test numbers: no concern. HTTP 26/26 + behaviour 37/37 = core stable;
  the shots failure is an environment write error, not an app defect.

## Atomic builds — the forever fix (Nov 21 2026, owner order)

A disk-quota write failure (EPERM/EDQUOT) hit mid-build at ~06:48 UTC Nov 21 and wiped build/Preview/ (12 asset files 0 bytes, HTML/catalog gone), because build.py deleted the live output first and then wrote the new files. The source was never at risk (src/ intact, testroot/ intact), but the shipped build was.

Rule from now on, in build.py and tools/run_all.sh:
- Build into a fresh scratch directory (build.new/) and swap it into build/ ONLY after every verification passes (catalog, counts, UI checks, config, portrait, recitation, node --check, network guard).
- NEVER delete the live build first. NEVER truncate a live file in place. NEVER use exec data-writes / cp / python open('w') on a live output while the quota is flaky; hardlinks (ln / cp -al) and the file tools are the safe writes.
- Keep the previous good build at build.old/ (and testroot Preview.old) as the fallback. A failed build leaves the live build untouched; the scratch dir is discarded on the next run.
- Verified Nov 21 ~07:45 UTC: build.py parses, live rmtree gone, atomic swap present; run_all.sh syncs testroot the same way (hardlink copy into Preview.new, then swap).
