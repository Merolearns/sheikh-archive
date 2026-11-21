# v4 test results

All runs on 2026-10-29, on this Linux VM, against the final build. `build/Preview/archive.html` is byte-identical to the copy in `testroot/Preview/`. One command runs everything: `bash tools/run_all.sh shots` (build, copy to testroot, start the real server, HTTP tests, behaviour tests, screenshots). Raw outputs are in `testroot/*.out` and screenshots in `shots/`.

Test bench: same as v3. `testroot/` is a stand-in archive folder with generated thumbnails for every catalog entry, three short playable `.mkv` files (one has a two-cue Arabic and English sample transcript), one corrupt file, and every other lesson missing (the 404 path). The server is v3's `archive_server.py`, run from `testroot/`. The headless Chromium (`/opt/meta-chromium/chrome`, driven by playwright-core) cannot open loopback, so the test scripts relay `http://archive.test` to the server.

## Build: `python3 build.py` (testroot/build.out)

- Catalog `DATA` is byte-identical to v3 in `archive.html` and `catalog.js` and deep-equal on parse: 3,977 media entries, 71 playlists, 4,320 memberships. Catalog version `3c30b87ae0c1` (unchanged from v3, as expected, since the data did not change).
- Curation resolves: 71 playlists mapped, 40 days, 3 first lessons, every ID in the catalog.
- Both flavors: no em dash, no external URL, no placeholder language.
- Server and both launchers byte-identical to v3. I also confirmed this separately with `cmp`.
- `recitation.mp3`: 250,529 bytes, 799 MPEG frames, about 20.9 s (the provenance doc says 20.8 s, and the browser reports a duration of 20.8 s). Byte-identical to the licensed file in the research folder.
- `node --check` on app.js passes.
- The guards can fail. In scratch copies I injected an em dash, `https://fonts.googleapis.com/css`, and "Biography awaiting confirmation" into the Credits string. Each one stopped the build with its own assertion. An untouched copy passed.

## Live HTTP: `tools/http_tests.py`, 26/26 pass (testroot/http-tests.out)

v3's checks (page at `/`, Arabic URL-encoded `.mkv`, ranges `0-99` and `-50`, `416` past the end, 404 on missing media for GET and HEAD, HEAD on media and `/`, `.vtt` and `.txt` MIME, `catalog.js` and its versioned URL, the hosted flavor carries no inlined DATA, assets), plus these v4 checks:

- `/__status` returns `"recitation": true`.
- `recitation.mp3` is served as `audio/mpeg` with exact bytes, and a Range request on it returns 206.
- The page carries the v4 edition string and `CATALOG_VERSION`.
- `docs/server-contract.md` is served.

## Behaviour: `tools/behavior_tests.js`, 37/37 pass (testroot/behavior-tests.out)

Kept from v3:

- Chrome does not move on AR to EN, and `dir` stays `rtl`.
- The nav has exactly 5 items.
- The opening has one control, is still animating at 900 ms, and Enter works mid-sequence.
- Reduced motion shows the final frame.
- The theme swatch switches the page live.
- Tapping a transcript line seeks the video and highlights the line.
- The 404 Details disclosure starts closed.
- The v2 favorites key still shows on Saved.
- Sort is a single disclosure.
- Offline: the context is offline and external requests are refused. The page renders, local fonts load, and there are 0 external requests and 0 page errors.

New in v4:

- **Recitation:** controls shown and silent by default. Enter plays it (src is `recitation.mp3`, duration 20.8 s). Starting a lesson video pauses and rewinds it. Pressing its play button pauses the video. Pause and mute work. Escape on the opening enters with no audio source loaded at all.
- **Scholars:** the home page has no Scholars section and no Bayoun card or name. The Bayoun series is reachable from the Beliefs pillar, from search for "عماد", "Bayoun" and "عقيدة", and at its direct URL with his byline.
- **Plurals:** no wrong count forms on 7 screens. The dual (`درسان`) and 3 to 10 (`٧ دروس`) forms render. Arabic durations use Arabic-Indic digits.
- **Search:** with no series but matching lessons, there is one message, "Show lessons" is primary and "Browse" is second, and no "0 results" counter appears. With true no-results, it offers "Clear search" plus a quiet "Browse the library".
- **Error states:** for both 404 and bad format, the video element is hidden and the khatam empty state shows with the notice.
- **Mark as watched:** persists across a reload and can be undone.
- **Motion:** staggered entrances and drawing dividers run on home. The Golden Thread bar sits on the tapped line and the line washes gold. Under Calm and under reduced motion, no hidden pending elements remain, no finite animations run, and the dividers show drawn.
- **Missing folder:** one calm Library banner, hidden after Hide.
- **40 days:** the closing line appears when all days are done, and Start again clears the ticks.
- **390px:** all five nav items are fully visible, and the theme picker and all six swatches stay inside the screen.

Earlier in this session the suite reported a pass after a crash partway through. The run script now prints the non-zero exit code whenever the suite fails or crashes.

## Screenshots: `tools/shots.js`, 65/65 pass checks (testroot/shots.out)

Desktop 1440x900 and mobile 390x844, Arabic and English: opening (mid and final), home, library, search, playlist, lesson with transcript, Where to Start, About (three tabs), Saved, theme picker, all 6 themes, the calm opening, and the 404 and bad-format errors. Each shot checks console errors, horizontal overflow against the device width, broken images, `dir`, and requests leaving the archive origin (0 in every shot).

Screens I reviewed by eye: the opening; home in Arabic on desktop and mobile; desktop lesson before and after the fixes; mobile English lesson; the 404 empty state; English search and mobile Arabic search; English About with Credits; the parchment theme; Saved; and the mobile theme picker. Review found five app defects, all fixed and listed in DECISIONS.md: the empty-state emblem collision, mobile corner size, prev/next frame anchoring, the lesson sidebar grid, and the "0 results" contradiction. The automated overflow check caught only one of them, the mobile search overflow. The other four were visual only.

## Not verified here

- Real MKV playback of the owner's library on the laptop. Only three tiny generated files were played.
- Recitation overlap with real lesson videos on the laptop. The no-overlap logic was tested only with the generated test videos in headless Chromium. Audio output itself was not heard. The tests read the media element state (playing, time, muted).
- The Windows `.bat` and macOS `.command` launchers were not run (no Windows or macOS here). They are byte-identical to v3, which was also not run on those systems.
- Safari and Firefox. Only Chromium was tested. View Transitions have a fallback in code, but I did not see it run in another browser.
- The hosted flavor was checked over HTTP and for structure, but not rendered at a real web host.
- I did not review all 65 screenshots by eye. The ones not listed above passed only the automated checks.
- Arabic wording and plural forms follow the track A notes and render as intended to me, but a native Arabic reader should still check the copy.
- This session (the fifth on v4) took over from earlier sessions that wrote most of the v4 source. I checked the build against the brief and fixed what the tests and screenshots exposed, but I did not reread the full track C motion spec line by line.
