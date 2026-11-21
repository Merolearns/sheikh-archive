# BRIEF V3 — the hundred-thousand-dollar edition

## Mission

Rebuild the Sheikh Moustafa Kamel offline video library as v3: the mesmerizing, premium, finished edition. The owner has ordered: no more questions, decide and deliver beautifully. This brief is the complete spec. Follow it exactly.

## Base: start from v2, do not start from zero

- v2 app source (your base): `~/workspace/archive-rebuild/build/Preview/archive.html` — single-file app. Reuse its catalog `DATA` **verbatim** (3,977 videos, 71 playlists, i18n dicts `S.ar`/`S.en`). Spot-check counts after reuse: exactly 3,977 `"media":` entries.
- v2 server: `~/workspace/archive-rebuild/build/Preview/archive_server.py` — keep behavior; only diff allowed is what v2 already added (`/__status` + recitation boolean).
- v2 launchers: `~/workspace/archive-rebuild/build/Start Archive - Windows.bat`, `~/workspace/archive-rebuild/build/Start_Archive_-_macOS.command` — keep **byte-identical**.
- v2 records: `~/workspace/archive-rebuild/TEST-RESULTS.md`, `DECISIONS.md` — read for context on what was verified and what was not.
- Work ONLY inside `~/workspace/archive-rebuild/v3/`. Never touch the 1.02 TB media (it is not on this machine anyway). Never touch the v2 build dir.

## Binding spec reports — read all four in full before coding

1. `~/workspace/research_notes/islamic-archive-design-research-20261029-0034/report.md` (round 1: restraint, 60-30-10, gold as line, theme tokens, typography, Sunni identity)
2. `~/workspace/research_notes/islamic-archive-round2-research-20261029-0430/report.md` (round 2: painted hero, fixed RTL chrome, silent recitation, four sections, font stack)
3. `~/workspace/research_notes/islamic-archive-round3-20261029-0007/report.md` (round 3: the v3 blueprint — premium mechanisms, offline motion catalog, simplicity audit, zero placeholders, richer patterns, hosting-ready, three opening treatments; follow its Synthesis §1-6 as build actions)
4. `~/workspace/research_notes/islamic-archive-content-mapping-20261029-0017/report.md` (content mapping: classical pillar order, 64 playlists mapped to pillar+level, 40-day path, six-step path with real series and computed durations, first lessons per level)

## Owner decisions — made by Noor under the owner's explicit "you are in charge, stop asking questions" order

1. **Opening treatment: "The Illuminated Page"** (round-3 §G treatment 2). ~3.4s WAAPI/CSS choreography: dusk scene dimmed, gold line draws the mihrab arch upward (~900ms), 8-pointed star medallion draws at the apex, arabesque flourishes at lower corners, scrim lifts, the verse does its ONE allowed fade+rise inside the completed frame, scholar's name, a near bird with articulated flap crosses behind the arch, the button draws itself like the frame then fills. Verse alone + exactly one Enter button on the opening, no toggles. Enter click mid-sequence jumps to final state and enters. Reduced motion: one static fully-composed legible frame.
2. **Beginner first lesson: tajweed, "الدرس الاول - تجويد - دكتور مصطفي كامل" (25m26s).** Classical Qur'an-first order.
3. **Pillar order (classical, binding):** Qur'an: Recitation and Understanding → Beliefs → Worship → Seerah and the Companions → Character and Purification of the Heart → Deeper Sciences (Arabic as an explicit sub-track inside Deeper Sciences).
4. **The 7 NEEDS-OWNER-REVIEW playlists** (Friday sermons mixed bag, دروس العشاء, دروس السبت, English Lectures, etc.): place them in a clearly labeled "Sermons and occasions" collection OUTSIDE the leveled path. Sensible default, noted in DECISIONS.md for later owner review. Never any "awaiting" language in the UI.

## Build actions

**A. Zero placeholders (round-3 §D — all 8, no exceptions):** delete the mission "draft awaiting confirmation" line entirely; remove every per-step "to be confirmed" marker in Where-to-Start (keep the real series mapping from the content-mapping report, one confident header: the library's suggested series); rhythm card becomes "One lesson a day, twenty to thirty minutes."; first-lesson card uses the real tajweed pick with no hedging; remove the About-the-Sheikh "Biography awaiting confirmation" block entirely (keep calligraphic monogram, full name, role line, archive-derived stats, series index); recitation lines become "Recitation is not included in this edition." Binding rule: a shipped screen never shows unfinished language.

**B. Radical simplicity (round-3 §C):** apply all 10 plain-language label replacements (e.g. "the folder that holds Preview" → "your library folder", "transcript file" → "text", raw paths behind a labeled "Details" disclosure); nav 7→5 (Home, Library, Where to Start, Saved + one "About" hub with three tabs); one "Sort" disclosure button (default series order, remembers choice); search-scope demoted to a quiet link (default whole library); one primary action per lesson card (Play/Resume full-width), Save as quiet star on the thumbnail corner, "Languages & Text" rendered ONLY when captions or transcripts exist; visual swatch theme picker with live preview. Rule: the interface asks nothing on first run.

**C. Offline motion everywhere (round-3 §B):** micro-interactions 90–360ms per the catalog (button press, hover lift, card gold-rule draw-in, bookmark pop + quiet sparkle, theme cross-fade, FLIP filtering, progress scaleX); View Transitions for section changes with CSS fallback; skeleton cards + `requestIdleCallback`-chunked rendering for the 4,000-video catalog; ambient slow (gradient drift, emblem rotation, birds on offset-path), max one ambient motion per screen; `prefers-reduced-motion` respected PLUS a "Calm motion" toggle; transform + opacity only, never bounce. Birds drawn as articulated bodies per round-3 §G bird craft (shoulder-pivot wings, feather notches) — never arcs.

**D. Richer patterns, disciplined (round-3 §E):** one khatam geometry at five scales; 28–32px medallion dividers between every home rail; double-gold-rule frames on featured cards only; manuscript-frontispiece frame on the opening; per-screen pattern budgets from the report. Richness through craft and repetition, not motif count.

**E. Tap-a-line transcript sync (round-3 §A1):** tap a transcript line to jump the video; current line highlights during playback. Keep in-page transcripts (owner loves them), font stack unchanged.

**F. Content (content-mapping report):** six-step path with REAL series, levels, plain-word prerequisites, computed durations; "Foundations in 40 days" from real lessons (20–30 min/day); first lessons per level (beginner: tajweed lesson 1; intermediate: نظرات في سورة مريم "1- مقدمة في سورة مريم" 23m20s; advanced: البيقونية "شرح البيقونيه - علم مصطلح الحديث (1)" 16m20s); question-led Where-to-Start cards; quiet checkmarks, never confetti.

**G. Hosting-ready architecture (round-3 §F):** versioned `catalog.js` split from the shell (single-file flavor inlines it; hosted multi-file flavor loads it); relative URLs everywhere; `build.py` stdlib-only producing both flavors; `docs/server-contract.md`; versioned storage wrapper; i18n stays data.

**H. Keep from v2:** fixed RTL chrome (never re-anchored on language switch); localStorage keys `archive-favorites-v4` / `archive-progress-v4` (owner's favorites/progress carry over); `/__status` endpoint + recitation boolean; silent recitation; Sunni scholarly identity and restraint.

## Hard rules

- Fully offline: ZERO external requests at runtime. Verify by test.
- No em dash character in any UI copy. Grep to verify.
- Verse text is never animated except its one 700–800ms fade+rise on the opening.
- Reuse catalog DATA verbatim; never renumber, rename, or reorganize media.
- Never include media files in any output.

## Verification (all required, recorded honestly)

- `build.py` assembles + verifies (counts, no external URLs, no em dash, zero placeholder strings).
- Live HTTP tests: v2's 16 plus catalog.js serving, `/__status`, and an offline test (page loads with network blocked).
- Headless-Chromium screenshots of EVERY major screen (opening, home AR/EN, playlist, lesson with transcript sync, Where to Start, About hub, theme swatches, search), eyeballed by you; timebox fix loops.
- Behavior tests: language switch keeps chrome fixed; opening has exactly one button; theme swatches switch live; transcript tap jumps video; 404 shows the human message with Details disclosure.
- Honest `TEST-RESULTS.md` (what ran, what could not be verified: real MKV playback on the laptop, Windows/macOS launchers, Safari/Firefox) and `DECISIONS.md`.

## Deliverable

`~/workspace/archive-rebuild/archive-rebuild-v3.zip` — app source ONLY, zero media: `Preview/archive.html` (v3 single-file), `Preview/archive_server.py`, `Preview/assets/` (fonts, SVG), `Preview/catalog.js`, `Preview/docs/server-contract.md`, both launchers byte-identical. Laptop-installable exactly like v2 (backup Preview, Expand-Archive -Force).

## Operating rules

- Full autonomous authority inside `~/workspace/archive-rebuild/v3/`. Never stop to ask questions.
- Checkpoint lines with ISO timestamps to `~/workspace/archive-rebuild/checkpoints.log` at each milestone.
- Work fast: reuse DATA verbatim, parallelize tracks, timebox screenshot-fix loops, deliver an early visual checkpoint (opening + home screenshots) as soon as it exists.
- When the build passes your screenshot review, create the ZIP and report: what you built, test results, anything unverified. Do NOT deliver anything to the owner directly.
