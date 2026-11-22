# Sheikh archive, v5 clone (working source)

This is the working source of the Sheikh Moustafa Kamel archive site, the
version that matches the live shared link. It is a clone of the v4 site
rebuilt to the v5 spec, with the Phase 2 fixes: three-button login
(Sign In, Sign Up, Enter as Guest), email sign-up and password reset
through the archive Supabase project, the home rail fix, the "Watch live
on YouTube" button, Q&A-style book covers, and the corrected book blurbs.

## Build

    python3 build.py

This writes `build/` (the installed-app bundle) and `preview/`
(the shareable bundle: `preview/index.html` plus `preview/assets/`).
The build reads the v4 tree from `../v4/build` and the book files from
`../v5/books-from-sheikh`, so this directory must sit beside `v4/` and
`v5/` in the repo, as it does here.

## Test

    bash tools/run_all.sh

Builds, then runs the HTTP checks (28) and the browser behaviour
checks (44). It serves `testroot/` on port 8765 and regenerates
`testroot/Preview/` from the build each run. The fixtures in
`testroot/` are `test-ids.json` plus symlinks to the repo-root
`testroot/` (videos, transcripts) and to `v5-prototype/books/files`.

## Login

Sign-in and sign-up are hand-rolled Supabase REST calls (no JS SDK).
The settings load from an embedded data URI first, with
`Preview/assets/supabase-config.json` as the fallback; the file
`src/assets/supabase-config.json` holds the archive project's own
public anon key and URL, already published in the live build. The
notice area starts empty and hidden and only shows a message after a
failed sign-in or sign-up attempt.

## Layout

- `src/` app source: `app.js`, `app.css`, `body.html`, `content.json`,
  plus `assets/` (fonts, images, the Supabase config)
- `build.py` the build, with its no-em-dash, no-external-URL and
  no-placeholder guards on the built UI
- `tools/` HTTP and behaviour tests, the test runner, screenshot tool
- `guard/` network guard and its tests
- `books/` generated book data for the Books section (the book files
  themselves live in `books/` at the repo root)
- `books-base.txt`, `books-base-docx.txt` the public bases the site
  reads book files from (jsDelivr for PDFs, raw.githubusercontent for
  the Word file)
