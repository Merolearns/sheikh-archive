# TEST-RESULTS.md — v2 rebuild verification

Real commands run and their real outputs. Anything not verifiable is stated plainly.

## Run of 2026-10-29 (final build, Linux VM)

Where tests ran: this VM. Server: `python3 testroot/Preview/archive_server.py` (port 8765) over `testroot/`, a stand-in archive folder made by `tools/make_testroot.py`: generated thumbnails/covers for every catalog entry, 3 short ffmpeg H.264 files named exactly like catalog entries (one with generated ar/en .vtt and .txt), 1 deliberately corrupt .mkv, everything else absent (404 path). No real media was touched or needed.

### 1. Syntax
- `node --check` on the page script: OK (run inside `build.py`).
- `python3 -m py_compile build/Preview/archive_server.py`: OK.

### 2. Catalog deep-equal (inside `build.py`, parses DATA back out of the built page)
```
catalog deep-equal OK: 3977 videos, 71 playlists, 4320 memberships, same IDs and order
```
The DATA literal is copied byte for byte from `archive-baseline/working/Preview/archive.html`, and the parsed object is compared with `==` to the baseline object. `build.py` also fails the build on any em dash or http(s) URL in src/.

### 3. Live server (`tools/http_tests.py`, real output)
PASS GET / full page :: 200 text/html 6755398 bytes (file 6755398)
PASS GET Arabic URL-encoded .mkv :: 200 video/x-matroska 1198628 bytes, Accept-Ranges=bytes
PASS Range bytes=0-99 :: 206 Content-Range=bytes 0-99/1198628 len=100
PASS Range suffix bytes=-50 :: 206 Content-Range=bytes 1198578-1198627/1198628
PASS Range past end -> 416 :: 416 Content-Range=bytes */1198628
PASS /__status JSON :: 200 {"videos_exists": true, "videos_count": 3983, "recitation": false}
PASS GET missing media -> 404 :: 404
PASS HEAD missing media -> 404 :: 404
PASS HEAD existing media -> 200 :: 200 Content-Length=1198628
PASS HEAD / -> 200 :: 200 text/html
PASS GET .vtt MIME :: 200 text/vtt; charset=utf-8
PASS GET .txt UTF-8 :: 200 text/plain; charset=utf-8
PASS asset Preview/assets/img/sunset.svg :: 200 image/svg+xml 5330 bytes
PASS asset Preview/assets/img/ornament.svg :: 200 image/svg+xml 485 bytes
PASS asset Preview/assets/img/girih.svg :: 200 image/svg+xml 11179 bytes
PASS asset Preview/assets/fonts/amiri-quran-400.woff2 :: 200 font/woff2 45680 bytes
FAILURES: 0
```
Startup with no videos folder (copy of Preview/ in /tmp/nov):
WARNING: videos folder not found at /tmp/nov/videos. Videos will not play until the app runs from the archive root.
Archive is running locally at: http://127.0.0.1:40695/
Preview page: Preview/archive.html. Transcript files are served unchanged.
This server listens only on this computer. Press Ctrl+C to stop it.
127.0.0.1 - - [28/Oct/2026 22:55:38] "GET /__status HTTP/1.1" 200 -

### 4. Headless Chromium screenshots (`tools/shots.js`) -> `shots/`
Every view at desktop 1440x900 and mobile 390x844, Arabic and English: opening, home, library (series), library (lesson search), playlist, lesson (real playback), Where to Start, About, Mission, About the Sheikh, Saved; home and library in all six themes at both widths; plus the 404 error, the decode-failure error, Arabic captions with transcript, and the Languages & Text dialog. Each shot also asserts: no console errors, no failed requests, no 4xx/5xx, no broken images, no horizontal overflow, `<html dir="rtl">`.
Result of the final run: 71 ok. Flagged shots, both expected:
- `desktop-ar-langs-dialog`: 404 for a transcript file the test folder does not contain (only one sample lesson has text files). The app shows its plain "could not be opened" message. Test-data gap, not an app defect.
- The two error-path shots log the 404 / failed load on purpose; they are excluded from the error assertion.
I looked at every screenshot myself. Fixed during review: cramped Kufi brand line (now Amiri Bold), girih reading as a tile grid (larger, fainter), flat series arch, citation digits running together ("20:114١١٤"), Enter button sitting on the dome finial, weak "first lesson" picks on Where to Start, Sheikh monogram text sitting on star lines, reversed year range in Arabic, too-faint near birds.

How the browser reached the server: this sandbox's Chromium refuses loopback navigation (`ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`). I did not change browser security flags. The test scripts load `http://archive.test/` and Playwright relays every request (method, Range header, status, headers, body) to the real server on 127.0.0.1:8765. So the real server served every byte, but the page origin in tests was `archive.test`, not `127.0.0.1`.

### 5. Behaviour (`tools/behavior_tests.js`, real output)
PASS chrome does not move on AR->EN :: [[".brand",1131,225],["#langSeg",84,156],["#nav",310,801],["#themeBtn",250,40]] vs [[".brand",1131,225],["#langSeg",84,156],["#nav",310,801],["#themeBtn",250,40]]
PASS html stays dir=rtl, text blocks switch lang :: {"y":900,"dir":"rtl","h1":"en"}
PASS scroll position kept on switch :: scrollY=900
PASS toggle labels never swap order :: العربية|English
PASS video continues across language switch :: t1=6.51 t2=7.77 same=true
PASS progress saved under the v1 key :: {"npEgn5Pz2G8":7}
PASS Listen controls disabled, honest status, no audio src :: {"dis":true,"status":"التلاوة بانتظار الترخيص، ولا يوجد تسجيل مرفق.","audio":null}
PASS opening: one button, verse with U+06DD marker, birds present :: {"buttons":1,"verse":"وَقُل رَّبِّ زِدْنِي عِلْمًا ۝١١٤","birds":7}
PASS Escape skips the opening :: splash hidden
PASS prefers-reduced-motion stops animation :: running animations=0
PASS Save persists and appears on Saved :: {"store":true,"cards":1}
FAILURES: 0
Two of these failed on first run and were traced to the tests, not the app: Playwright's click() scrolled the sticky header into view (a DOM click keeps scroll at 900), and progress was read before the async pause event fired.

### Could NOT verify
- Real lesson playback from the owner's 1.02 TB library and real MKV codecs: needs the owner's Windows machine. Only small generated H.264 files were played here.
- Windows launcher and macOS launcher: not executed (no Windows/macOS here). Both are byte-identical to the baseline launchers.
- Safari and Firefox rendering of Amiri Quran, the U+06DD verse marker and the Allah ligature: only Chromium was available.
- Opening the page at `http://127.0.0.1:<port>/` in a browser on this VM: blocked by the sandbox (see relay note above). Server behaviour at that URL was verified with direct HTTP requests.
- Recitation playback: no recording is bundled by design; the enabled path (file present) was not exercised with real audio.
- Real transcripts with Windows-1256 or mojibake text: the server serves files unchanged, as in the baseline; not tested with real files.
