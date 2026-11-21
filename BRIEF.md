# MISSION: Rebuild the Sheikh Moustafa Kamel offline video library (v2)

You are the coding lead. The owner has ordered: Claude Code is in charge of the coding, end to end. All research is done and is your spec. Do not ask the owner questions. Use your judgment on every detail the spec leaves open, and record each judgment in DECISIONS.md so it can be reviewed later.

## How you operate

- You run DETACHED on this Linux VM. The owner is not watching. Never stop to ask anything.
- Write checkpoint markers to `checkpoints.log` in this directory, one per milestone, format: `CHECKPOINT <ISO time> <what finished>`.
- Keep a daily `TEST-RESULTS.md` with what you actually ran and the real outputs. State plainly anything you could NOT test.
- Keep `DECISIONS.md`: every judgment call you made and why.
- Keep `DESIGN-STANDARD-FIXES.md`: anywhere the design standard (below) turns out to be wrong or incomplete once you build it. Do not edit the standard yourself; Noor applies fixes.
- Work ONLY inside `~/workspace/archive-rebuild/`. Build output goes in `~/workspace/archive-rebuild/build/`.
- NEVER touch the real media. The 1.02 TB of videos lives on the owner's Windows machine, not on this VM. You do not have it and must not need it. Generate small sample media files (ffmpeg) for testing, named exactly like catalog entries.
- Do NOT modify `~/workspace/archive-baseline/` (pristine reference). Read from it freely.
- No network requests at runtime, ever. The final app must work fully offline from file serving over localhost.

## Source material (read these first)

1. `~/workspace/archive-baseline/working/Preview/archive.html` — the current single-file app (6.7 MB). Its embedded catalog DATA is the ground truth: 3,977 videos, 71 playlists, 4,320 playlist memberships. Your rebuild must reuse this catalog EXACTLY. Verify with a deep-equal check (counts + IDs + order) and record it.
2. `~/workspace/archive-baseline/working/Preview/archive_server.py` — the Python server. Keep its behavior: serves the archive root, port 8765 with fallback, `/` serves the page, Range/206 support, MIME map including `.mkv` → `video/x-matroska`, UTF-8 for text. Keep both launchers byte-identical (`Start Archive - Windows.bat`, `Start_Archive_-_macOS.command`).
3. `~/workspace/research_notes/islamic-archive-design-research-20261029-0034/report.md` — round 1 design research (the full system: 60-30-10, gold as a line not a fill, text outranks decoration, restraint is premium, themes as tokens, motion timings, Sunni identity rules, anti-patterns).
4. `~/workspace/research_notes/islamic-archive-round2-research-20261029-0430/report.md` — round 2 (hero verdict, language behavior, recitation, sections, fonts). Its per-question recommendations are binding unless building proves them wrong (then log in DESIGN-STANDARD-FIXES.md).

## The spec (binding)

OPENING: full-screen flat vector painted sunset (hand-built SVG: indigo to amber sky, silhouette domes and minarets, geometric border, small file). On it, alone: the verse وَقُل رَّبِّ زِدْنِي عِلْمًا (Ta Ha 20:114) with its citation, the scholar's name فضيلة الشيخ الدكتور مصطفى كامل, and ONE Enter button. No toggles, no options, no second verse on the opening. Animated birds: natural silhouettes with wing articulation, smooth flight paths, several sizes and speeds, depth. The previous attempt looked like two plain arcs and was rejected.

RECITATION: silent by default. When the user presses Enter (or a Listen control), play `assets/recitation.mp3` IF present; if absent, the Listen control is disabled with the honest status "Recitation licence pending — no recording bundled." Controls: play/pause/replay/mute/volume. Stops instantly on skip. Never overlaps video audio. Never synthesize or imitate a reciter. For this build: implement the slot, ship WITHOUT audio.

LANGUAGE: chrome is fixed and anchored once in Arabic RTL (the archive is Arabic-first). Only text blocks switch language and direction. A segmented العربية | English control sits in one fixed corner; its labels never swap order; only the highlight slides. The emblem, pattern, calligraphy, and media controls NEVER mirror. Only directional arrows inside lesson cards mirror per-block. The owner explicitly hates the whole page jumping sides on switch.

THEMES as tokens (whole app restyles): Emerald (default), Parchment, Midnight, Sand, Sunset, Pure Dark. 60-30-10. Gold is a line, not a fill. One pattern per screen, never behind text. 8-point star/khatam for emblems and dividers; girih cropped oversized at 4-8% opacity on heroes only; arch/mihrab containers.

HOME: hero (calligraphy watermark + centred search + two buttons: Browse Library / Continue Watching), then Continue Watching → Featured Series → Scholars rails.

LIBRARY: 4-column thumbnail card grid using each playlist's `cover` field; EVERY card has an Open action. Cards: series eyebrow, two-line title, scholar/duration/source line, gold progress bar, offline glyph. Arch-topped series cards. Sidebar with at most 8 items and counts. Search plus sort. Scoped search.

SECTIONS: Where to Start (most prominent: one 20-minute first session, three self-sort cards, six-step numbered path Beliefs → Worship → Seerah → Qur'an → Character → Deeper sciences, each with level and prerequisite pills; anything not yet known is a visible [to be confirmed] placeholder, never invented), About, Mission (three pillars: dismantle doubts, nurture conviction, inspire contribution), About the Sheikh (only verified facts; everything else [to be confirmed]; use a calligraphic monogram, not a photo).

VIDEO CARDS: Save, Resume (only when there is progress to resume), Languages & Text (Arabic/English captions and transcripts, fetched on demand, small cache, persisted, offline).

PLAYER: on error, HEAD-probe the media URL. 404 → "Video file not found on this computer. Expected location: …"  (never the misleading format message). Real decode failure → the format message suggesting VLC. Server logs at startup whether the videos folder exists and how many entries it has, or a WARNING. Add `GET /__status` returning `{videos_exists, videos_count}` JSON.

FONTS (bundle as WOFF2, all open-licensed): Amiri Quran for verse display (line-height 2.0-2.2+), Noto Sans Arabic for Arabic UI/body (1.7-1.8), Amiri Bold for Arabic headings, one Kufi face for emblems and short labels only, system stacks for Latin. Subsetting must keep GSUB/GPOS and Qur'anic ranges. Write الله as letters and let the font form the ligature. One verse-end convention (U+06DD + number). Never letterspace or italicise Arabic. Never animate sacred text itself.

MOTION: ambient 12-40s (gradient drift, slow emblem rotation), interactive 150-300ms ease-out, orchestrated 400-600ms; transform and opacity only; respect prefers-reduced-motion. No bounce, no confetti, no gamification, no autoplay carousels.

COPY RULES: plain, warm, dummy-proof language. Arabic-first. NEVER use the em dash character (—) anywhere in user-facing text. Correct honorifics. Quran and Sunnah evidence first, scholar second. Full attribution (scholar/book/date/grading) wherever a teaching is quoted.

ANTI-PATTERNS (never): neon gradients, clip-art crescents, clickbait thumbnails, anonymous unsourced content, mandala-as-logo, wallpaper pattern, gold flood, flat hierarchy with no focal point.

## Verification (actually run all of this; record real outputs)

1. JS syntax check on the page script; Python syntax check on the server.
2. Live server test on this VM: root URL 200 with full page; Arabic URL-encoded media file 200 with correct MIME; Range request 206 with correct Content-Range; `/__status` JSON; missing file 404; HEAD 200/404 behavior.
3. Catalog deep-equal vs the baseline: 3,977 videos, 71 playlists, 4,320 memberships, same IDs and order.
4. Headless Chromium screenshots of EVERY major view, at desktop and mobile widths: opening, home, library grid, playlist view, lesson view, Where to Start, each of the six themes, Arabic and English modes. You run ON this VM, so localhost works for you. EYEBALL every screenshot yourself and fix anything that looks cheap, empty, or broken. No console errors. No broken images. No mobile overflow.
5. State honestly in TEST-RESULTS.md anything you could not verify (e.g. real-video playback needs the owner's machine; macOS launcher untested).

## Delivery

- `build/` contains: `Preview/archive.html`, `Preview/archive_server.py`, both launchers, `assets/` (fonts, SVG art, ornament). Everything the app needs, nothing else.
- When the build is complete AND your own screenshot review passes, create `~/workspace/archive-rebuild/archive-rebuild-v2.zip` containing ONLY the app source (never media).
- Do NOT hand anything to the owner directly. Noor reviews before delivery.

Begin now. First checkpoint: spec read + build plan written to checkpoints.log.
