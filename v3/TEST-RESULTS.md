# v3 test results

All runs on 2026-10-29, on this Linux VM, against the final build (`build/Preview/archive.html` byte-identical to the copy in `testroot/Preview/`). Raw outputs are in `testroot/*.out`; screenshots in `shots/`.

Test bench: `testroot/` is a stand-in archive folder. It reuses v2's test media: generated thumbnails for every catalog entry, three short playable `.mkv` files (one with a sample Arabic and English transcript), one corrupt file, and every other lesson missing (the 404 path). The server is the real v2 `archive_server.py`, run from `testroot/Preview/`. The headless Chromium (`/opt/meta-chromium/chrome`, via playwright-core) cannot open loopback, so the test scripts relay `http://archive.test` to the server.

## Build: `python3 build.py` (testroot/build.out)

- Catalog `DATA` literal byte-identical to v2 in `archive.html` and `catalog.js`, deep-equal on parse: 3,977 `"media":` entries, 71 playlists, 4,320 memberships. Catalog version `3c30b87ae0c1`.
- Curation resolves: 71 playlists mapped, 40 days, 3 first lessons, every ID in the catalog. `tools/resolve_content.py` checks every title and duration against the content-mapping report and fails on any mismatch.
- Both flavors: no em dash, no `http(s)://` URL, no placeholder words (awaiting, to be confirmed, draft, coming soon, TODO, Arabic equivalents) outside the catalog literal.
- Server and both launchers byte-identical to v2. `node --check` on app.js passes.
- Proved the guards can fail: injecting "Biography awaiting confirmation", an em dash, and a Google Fonts URL into a scratch copy each stopped the build with the matching assertion.

## Live HTTP: `tools/http_tests.py` 23/23 pass (testroot/http-tests.out)

v2's 16 (page at `/`, Arabic URL-encoded `.mkv`, Range `0-99`, suffix range, `416` past end, `/__status`, `404` on missing media for GET and HEAD, HEAD on existing media and `/`, `.vtt` and `.txt` MIME, assets) plus: `catalog.js` served as `text/javascript` with 3,977 entries, versioned `catalog.js?v=` matches the hosted page's meta version, hosted flavor has no inlined DATA, `/__status` carries `recitation: false`, `docs/server-contract.md` and two more fonts served.

## Behavior: `tools/behavior_tests.js` 14/14 pass (testroot/behavior-tests.out)

1. Language switch AR to EN: brand, language toggle, nav and theme button keep the same x and y; `html` stays `dir="rtl"`; scroll kept. (First run failed: a 1 to 2px vertical shift. Fixed, see DECISIONS.)
2. Nav has exactly 5 items.
3. Opening has exactly one control; at 900ms its animations are still running; clicking Enter then enters the library.
4. Reduced motion: no running animations, verse and button fully visible.
5. Theme swatch switches the page live (background colour changes, choice stored), 6 swatches.
6. Tapping transcript line 2 moves the video to 0:05 and highlights that line.
7. Missing video: plain message, raw path only inside a closed Details disclosure.
8. Recitation: controls hidden, status "لا توجد تلاوة مرفقة في هذه النسخة.", no audio source.
9. A favorite stored under `archive-favorites-v4` (v2 key) shows on Saved.
10. Sort is one disclosure (no select), defaults to series order, choice survives a reload.
11. Offline: browser context set offline and every non-archive request refused; home renders, 6 local fonts load, 0 external requests, 0 page errors.

## Screenshots: `tools/shots.js` 65/65 pass checks (testroot/shots.out)

Desktop 1440x900 and mobile 390x844, Arabic and English: opening (mid-sequence and final), home, library, search, playlist, lesson with transcript, Where to Start, About hub (three tabs), Saved; theme picker; all 6 themes; reduced-motion opening; 404 and bad-format errors. Each shot checks console errors, horizontal overflow against the device width, broken images, `dir`, and requests leaving the archive origin (0 in every shot).

I looked at the opening, home (AR, EN, mobile), lesson (desktop, mobile AR and EN), Where to Start, About the Sheikh, theme picker, parchment theme, playlist, library, Saved, Mission, calm opening and 404. Four layout defects found and fixed (listed in DECISIONS). The overflow check first missed the mobile lesson bug; it was corrected and the fixed version would have caught it (it reads 95px on the old layout).

## Not verified here

- Real MKV playback of the owner's 1.02 TB library on his laptop. Only three tiny generated files were played. Codec support for real files depends on the laptop's browser.
- The Windows `.bat` and macOS `.command` launchers were not run (no Windows or macOS here). They are byte-identical to v2, which was also not run on those systems.
- Safari and Firefox. Only Chromium was tested. View Transitions and CSS `offset-path` birds have fallbacks in code, but those fallbacks were not seen running in another browser.
- The hosted flavor was checked over HTTP and for structure, not rendered in a browser at a real web host.
- Arabic copy and the classical ordering read as intended to me, but a native Arabic reader should still check the wording.
- This session took over from an earlier session that had written the app source and resolved the content. I read the brief in full and checked the build against it, but I did not reread all four research reports. Where the app follows them, it follows what that earlier session built.
