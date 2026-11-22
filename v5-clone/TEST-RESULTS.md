# V5 clone: test results (Nov 21, 2026, this VM, headless Chromium)

Builder-run checks only. The item-2 owner-hardware gate and independent live-agent testing
have NOT run; nothing here counts as that gate.

## Passed on the final build

| Check                | Result               | Where / what it checked                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build.py`           | pass                 | catalog deep-equal to v4 (3,977 videos, 71 playlists, 4,320 memberships), curation resolves, 34 books / 40 files with no title or file twice, no em dash, no placeholder words, no remote URL except the YouTube embed + website still, launchers and server byte-identical to v4, recitation valid, `node --check`, network guard 0 violations, preview bundle assets present and non-empty |
| HTTP tests           | 28/29                | local server: pages, Arabic URL media, ranges, assets, every listed book file served, PDF byte ranges; the one failure is a transient jsDelivr 403 on a single book file during the 40-file HEAD burst (a different file each run; the file re-checks 200 directly, and the previous full run was 29/29). Plus the new admin check: page carries the admin view, overrides and held book, no service key |
| Behaviour tests      | 44/44                | v4's 37 checks, plus: opening shows again on the next visit, 34 books no title twice, English filter, PhD 4 parts with Read + Open file, missing part shows missing state while the other stays readable, Library sidebar link, About drops years and shows 2 verified stats                                                                                                                 |
| Admin tests          | 15/15                | new suite (`tools/admin_tests.js`): guest and non-admin see no admin link and `#/admin` sends them Home with nav still 5 items; admin link appears for the owner only; 34 books listed, book-06 shows 32 pages, book-38 held with its title and no author named; book edit stages into the overrides JSON and updates the row live; settings tab stages an announcement with the live toggle on; users tab shows the setup note with the SQL file and zero fabricated rows; series search filters, video search finds matches; staged changes persist across reload and clear cleanly |
| Screenshots          | 73 shots, 0 failures | desktop + 390px, AR + EN, 6 themes, calm, error states, Books list + detail; 0 horizontal overflow, 0 broken images, 0 external requests                                                                                                                                                                                                                                                     |
| Catalog audit tests  | 2/2                  | `audit/test_audit_catalog.py`                                                                                                                                                                                                                                                                                                                                                                |
| Network guard tests  | 8/8                  | includes injected remote asset and malformed YouTube link failing                                                                                                                                                                                                                                                                                                                            |
| Preview bundle guard | 0 violations         | `preview/index.html`                                                                                                                                                                                                                                                                                                                                                                         |

## V4 look comparison (website layout, same screens)

| Build                  | Web fonts loaded                                                           | Missing assets                       |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| V4 published preview   | Amiri, Amiri Quran, Noto Sans Arabic (3 weights), Reem Kufi on Sheikh page | 0                                    |
| V5 as published Nov 21 | none                                                                       | fonts, sunset, girih, ornament (404) |
| V5 clone `preview/`    | same set as V4                                                             | 0                                    |

Screens eyeballed side by side: opening, home, library, playlist, About the Sheikh, mobile home,
sign-in form (desktop + 390px), Books list + detail, website lesson page.

## Not verified here (needs a person or another machine)

- YouTube actually playing in the page: the frame gets the correct nocookie URL; the video itself
  was not played (test harness blocks YouTube).
- Thumbnails from YouTube on the website: URL built correctly and reachable from this VM by curl;
  not seen rendering in this headless run.
- Supabase email sign-in end to end with a real account; per-account progress sync is still a stub.
- Transcripts on the website: transcript files are not in the hosted bundle (404, same as V4's preview).
- Everything in brief item 2 (owner laptop, real MKV, audible recitation, launchers, Safari/Firefox,
  iOS fullscreen, native-Arabic sign-off, real-host render).
