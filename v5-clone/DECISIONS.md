# V5 clone: decisions (Nov 21, 2026)

Owner order: clone V4 and do everything there; V4's look is the bar.

## Why the published V5 looked plainer than V4

Proven, not guessed. The web host serves `index.html` plus files under `./assets/` only.
The published V5 page asks for `Preview/assets/fonts/*.woff2`, `Preview/assets/img/girih.svg`,
`ornament.svg` and `sunset.svg`. Those paths 404 on the host (its deploy manifest ships them
under `assets/Preview/...`). Headless check of the live layout: 0 web fonts loaded, the sunset
scene, girih pattern and divider medallions missing. V4's preview rewrote every path to
`assets/...`, so it loaded all of them. The V5 source code never changed V4's visual design.

## How the clone was made

1. `v4/src/` copied to `v5-clone/src/` (byte-identical, checked with `diff -rq`).
2. V5 feature diff (v4 to v5-prototype src: login, dual playback, portrait, bio, chunked render)
   applied with `patch`; result byte-identical to `v5-prototype/src`.
3. The three fixes that landed only in the published artifact (entry page every visit, YouTube
   stills on the website, dividers draw on every scroll into view) plus the reveal safety net,
   extracted from the artifact and applied; result byte-identical to the artifact's code.
4. Then the changes below. `v4/`, `v5/src/`, `v5-prototype/` and the artifact were not edited.

## Changes made in the clone

- `build.py` writes `preview/`: `index.html` plus `assets/` in the layout the host serves.
  Every referenced asset is asserted present and non-empty. Recitation status check replaced
  (no server on the website), same as V4's preview.
- Opening page: the prototype's `.sp-in{overflow-y:auto}` clipped the verse sideways
  ("وَقُل" cut off). Removed. While the email form is open, the divider and name line step
  aside (and the citation on phones) so the form fits inside the arch. `hidden` buttons now
  actually hide. The form's second button says "Enter as Guest" and now does exactly that.
- About: "years of publishing" and "hours" stats removed (brief item 5: unverified). Orphaned
  helpers and strings removed. Stat row lays out however many verified cells remain.
- Books (item 4): integrated as `#/books` and `#/book/<id>` using V4's series card and page
  header. One entry per work; volumes and parts nest inside it. 34 works, 40 files, build
  fails if a title or file repeats. Held for the owner: everything on
  `books/owner-review-list.json`, plus "Proud To Be Muslims" (no author in the file).
  Linked from the Library sidebar and the About the Sheikh page; no 6th nav item.
  Installed app: Read opens the browser's PDF viewer in a new tab, Open file downloads;
  a missing file shows "not in the books folder" (same-origin HEAD only). Website: metadata
  and covers only, "Available in the installed app".
- Website wording: brand line, footer, hero and About offline copy now say it opens from a
  link (V4 preview wording, without "no account" because V5 has sign-in).
- Website lesson page no longer points the player at a local file, so the "not on this
  device" error no longer appears under the YouTube player.
- Network guard allows exactly one more expression: the website-only YouTube still URL
  built from the video ID. Any other remote URL still fails (tested).

## Kept from V4 on purpose (flag for the owner)

- "الدكتور" / "Dr." in the opening, header and Sheikh page. The bio source states the doctorate
  in the Sheikh's own words; the brief asks for owner confirmation before carrying the title.
- Installed-app About text still says "No account" (V4 copy). Sign-in is optional, but the
  sentence should go to the native-Arabic copy review.
