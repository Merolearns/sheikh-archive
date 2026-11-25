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

## Admin page

`#/admin` is visible only to the owner's account
(meroatschool@gmail.com): other signed-in users never see the admin
link and are sent back to Home. The page has four tabs: Books (list
with page counts, edit title/count, hide/show; book-38 "Proud To Be
Muslims" stays held with no author shown until the Sheikh confirms
it), Series and videos (edit series and video titles), Users (sign-up
list), Settings (announcement banner, live-video button toggle).

Design, honestly: the anon key can never list Auth users, so the Users
list reads a `profiles` table written at sign-up and sign-in
(`src/admin-profiles.sql` — run once in the Supabase SQL Editor; only
the admin email can read it). Until that SQL is run, the Users tab
says so and shows no users. Admin edits are staged in the browser and
shown as `src/admin-overrides.json`; they take effect only after that
file is committed to the repo and the site is republished. Nothing
privileged exists in the browser: anon key only, never a service key.
Book-06's count is corrected to 32 pages in the overrides file. Tests:
`node tools/admin_tests.js http://127.0.0.1:8765` (run by
`tools/run_all.sh` after the behaviour suite).

Adds and edits (Nov 25, 2026): the admin can also add a book (titles,
language, pages, file name or full books-host link), edit a book's
language, and edit page count and file on single-file books; add a
series (YouTube playlist ID or link, Arabic and English titles); add a
video to a series by pasting its YouTube link (the ID is read from the
link); remove and reorder a series' videos. An added book's PDF still
has to reach the repo through the daily fetch or a commit: the page
cannot upload files. Added videos play through the existing
youtube-nocookie embed. Who counts as admin comes from
`settings.adminEmails` in the committed overrides (default
`["meroatschool@gmail.com"]`); the Users list read policy in
`src/admin-profiles.sql` still names only that one email.

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
