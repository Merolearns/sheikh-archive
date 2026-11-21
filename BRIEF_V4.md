# BRIEF V4 — the voice edition

## Mission

Build v4 of the Sheikh Moustafa Kamel offline video library. v3 is installed and praised by the owner ("best one so far", opening animation praised). v4 adds: the opening verse WITH VOICE (licensed recitation found), the Scholars-section fix, animation inside the library, and the full audit-fix list. The owner ordered: no questions, decide and deliver beautifully. This brief is the complete spec.

## Base: start from v3

- v3 as shipped: `~/workspace/archive-rebuild/archive-rebuild-v3.zip` (extract a working copy; or use the v3 build dir under `~/workspace/archive-rebuild/v3/`). Reuse its catalog `DATA` **verbatim** (3,977 videos). Keep the server and both launchers byte-identical (v3's server == v2's server).
- Work ONLY inside `~/workspace/archive-rebuild/v4/`. Never touch media. Never touch the v3 build dir.
- Binding background: `~/workspace/archive-rebuild/BRIEF_V3.md` + the four research reports under `~/workspace/research_notes/` + the v4 improvement report below.

## Binding spec — read in full before coding

`~/workspace/research_notes/islamic-archive-v4-improvements-20261029-0426/report.md` (tracks A–F, 12 prioritized recommendations, scholars decision, recitation verdict). Its `notes/` hold the builder-ready specs (esp. `track-c-animation.md`: 248-line motion spec; `track-e-patterns.md`: 12 placements; `track-a-audit.md`: findings).

## The 12 build actions (in priority order)

1. **Arabic pluralization.** Fix count strings for 2 and 3–10 across the whole UI (the most visible "not quite right" signal to a native reader). Details in track A notes.
2. **The voice.** Bundle `~/workspace/research_notes/islamic-archive-v4-improvements-20261029-0426/recitation.mp3` (Ṭā Hā 20:114, 20.8 s, CC0 1.0, reciter Aaqib Azeez — provenance in `recitation-provenance.md`) as `Preview/assets/recitation.mp3`. The app already exposes the `recitation` boolean and the Listen control enables itself — wire it, keep the silent-by-default UX (plays on the user's Enter/tap, with play/pause/replay/mute/volume, stops on skip, never overlaps video audio). Include the attribution line from the provenance doc in About > Credits.
3. **Scholars section: REMOVE from the home page.** Decision is final: a demoted row of people is still a people-listing. The Sheikh already opens the experience, titles the hero, signs every series-card byline, and owns an About-hub tab. The "Aqeeda by Dr Imad Bayoun" playlist stays as an ordinary searchable, playable series card under the Beliefs pillar with his name as a byline — in the Library grid, in search, at its direct URL — but in NO curated home rail. No explanatory copy about the absence.
4. **Animation inside the library.** Implement the track-C motion spec: staggered card entrances, "The Drawn Line" (rail dividers draw as they scroll into view — the inside echo of the opening's illuminator), View-Transition page changes, FLIP filtering, "The Golden Thread" (gold bar glides transcript line to line during playback; tap seeks with a gold wash). Every spec ships with its calm fallback (`prefers-reduced-motion` + Calm toggle). Offline only; transform/opacity only.
5. **Mobile 390px clips.** Fix the theme-picker swatch panel overflow and the 5th nav item clipping.
6. **Search no-results.** Fix the contradiction ("no matching series" vs "123 lessons found"); add the quiet "Browse the library" second action.
7. **Error states.** Hide the dead native video element on error screens; render the designed empty state (khatam emblem + notice) in the player area.
8. **Mark as watched.** Manual "mark as watched" on lessons (the 40-day checkboxes already prove the pattern and persistence).
9. **Patterns, 12 placements.** Player frame, empty-state frames, footer medallion, stats-band girih, dialog medallions — per track E, under the draw-on-once technique rules. Binding non-goals: no lattice behind grids, no pattern in the transcript body.
10. **Numerals.** Unify per language: Arabic-Indic everywhere in Arabic UI (durations included); drop one of the two conflicting numbers in the lesson sidebar.
11. **Hosting future.** Emit `CATALOG_VERSION` at build time; write `docs/server-contract.md`.
12. **Calm states.** Missing-`videos`-folder surfaces once as a calm Library banner (not a red alert); add the quiet 40-day completion terminus line.

## Must not regress (audit-verified excellent in v3)

The Illuminated Page opening choreography; tap-a-line transcript sync; zero placeholder/draft language anywhere; fixed RTL chrome; theme picker + Calm motion toggle; About stat row; one primary action per card; in-page transcripts; the font stack.

## Hard rules (unchanged)

- Fully offline: ZERO external requests at runtime. Verify by test.
- No em dash character in any UI copy. Grep to verify.
- The verse text is never animated except its one allowed fade+rise on the opening.
- Catalog DATA reused verbatim; never renumber, rename, or reorganize media.
- Recitation: the CC0 file above is the licensed path — never swap in another recording, never AI audio.
- Never include media files in any output.

## Verification (all required, recorded honestly)

- `build.py` assembles + verifies (counts, no external URLs, no em dash, zero placeholder strings, recitation.mp3 present and valid audio).
- Live HTTP tests incl. `/__status` showing `recitation: true`, catalog.js, offline test.
- Headless-Chromium screenshots of every major screen (both languages, 6 themes, mobile 390px), eyeballed by you; timebox fix loops.
- Behavior tests: recitation plays/stops correctly (no overlap with video), Scholars section gone, Bayoun playlist reachable via Library/search, motion specs with calm fallbacks, pluralization spot-checks, search no-results, error empty states, mark-as-watched persistence.
- Honest `TEST-RESULTS.md` (what ran, what could not be verified: real MKV playback on the laptop, Windows/macOS launchers, Safari/Firefox, real-video recitation overlap on the laptop) and `DECISIONS.md`.

## Deliverable

`~/workspace/archive-rebuild/archive-rebuild-v4.zip` — app source ONLY, zero media: `Preview/archive.html` (v4 single-file), `Preview/archive_server.py`, `Preview/assets/` (fonts, SVG, **recitation.mp3**), `Preview/catalog.js`, `Preview/docs/server-contract.md`, both launchers byte-identical. Laptop-installable exactly like v3.

## Operating rules

- Full autonomous authority inside `~/workspace/archive-rebuild/v4/`. Never stop to ask questions.
- Checkpoint lines with ISO timestamps to `~/workspace/archive-rebuild/checkpoints.log` at each milestone.
- Work fast: reuse DATA verbatim, parallelize tracks, timebox screenshot-fix loops, early visual checkpoint.
- When the build passes your screenshot review, create the ZIP and report: what you built, test results, anything unverified. Do NOT deliver anything to the owner directly.
