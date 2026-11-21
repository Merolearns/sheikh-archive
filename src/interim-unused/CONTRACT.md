# INTEGRATION CONTRACT (binding for all track builders)

## Assembly (build.py, owned by integrator)
Final `build/Preview/archive.html` is assembled in this exact order:
1. `src/01_head.html` (doctype, head, @font-face, tokens, base CSS; ends INSIDE the <style> block)
2. `src/css/track-*.css` (alphabetical) then `</style></head><body>`
3. `src/html/00_shell.html` (topbar, footer; written by integrator) then `src/html/track-*.html` (alphabetical)
4. `<script>const DATA = ` + VERBATIM DATA literal from baseline + `;</script>`
5. `<script>` + `src/js/core.js` (integrator) + `src/js/track-*.js` (alphabetical) + `</script></body></html>`

`src/early/*` is NEVER included in the final assembly (early visual only).

## CSS rules
- Use ONLY the tokens from 01_head.html: var(--bg), --bg2, --bg3, --bg4, --ink, --ink2, --ink3, --line, --line-soft, --brand, --brand-ink, --brand-deep, --gold, --gold-2, --card-shadow, --pattern-op, --hero-veil, --r, --r-s, --shadow, --ease, and fonts var(--font-verse), var(--font-head), var(--font-ar), var(--font-kufi), var(--font-lat).
- NEVER hardcode a color. Every theme (emerald/parchment/midnight/sand/sunset/puredark) must restyle automatically.
- Class/ID prefixes per track: splash `sp-`, home/library `hm-`/`lb-`, playlist/lesson `pl-`/`ls-`, sections `sc-`. Never reuse another track's prefix. Never style bare elements except within your prefix scope.
- `.view` sections are hidden by default; core adds `.on` to show. Do not fight this.
- No global resets. No `* { }` selectors.

## HTML rules
- Each track html file contains `<section class="view" id="view-<name>">` blocks only (splash uses `<div id="sp-splash">`).
- Static skeleton with empty containers is fine; JS fills them.
- All user-facing copy: Arabic-first, then English. Plain, warm, dummy-proof words.
- NEVER use the em dash character (—) anywhere. Use commas or parentheses instead.
- Images: `Preview/assets/img/<file>` or `Preview/assets/fonts/<file>`, relative paths exactly like this. (The page is served at the server root `/` while its file lives in `Preview/`; `videos/...` resolves to the root correctly, but assets live under `Preview/assets/`.)

## JS rules
- `const DATA` is global: `DATA.videos[]`, `DATA.playlists[]`.
  - video: {media (URL-encoded relative path), id, subtitles ([{lang,label,readSrc,src}] or [null]), order, playlistIds[], titleEn (""), uploadDate, categories, title, duration (sec), thumbnail (URL-encoded webp path)}
  - playlist: {id, cover (webp path), titleEn (""), count, title, items: [{id} in playlist order]}
- Wrap everything in an IIFE. Touch ONLY the `window.App` namespace (created by core.js).
- Core provides: `App.state {lang, theme, favs:Set, prog:{vidId:sec}}`, `App.t(key)` (i18n), `App.esc(s)` (HTML escape), `App.fmtDur(sec)` ("12:34" / "1:02:03"), `App.vid(id)`, `App.pl(id)`, `App.go(hash)` (sets location.hash), `App.save()` (persists state), `App.addStrings({ar:{},en:{}})` (register track strings), `App.rerender()` (re-renders current view; call after lang/theme change if your view caches HTML).
- Router (core) calls `App.render<viewname>()` when a view activates. Expose yours: e.g. `App.renderSplash`, `App.renderHome`, `App.renderLibrary`, `App.renderPlaylist(id)`, `App.renderLesson(id)`, `App.renderStart`, `App.renderAbout`, `App.renderMission`, `App.renderSheikh`, `App.renderFavs`.
- Wire your own elements by your prefixed IDs. Do not depend on other tracks' elements.
- Boot params (core handles): `?splash=0` skips splash, `?theme=X`, `?lang=en`. Hash routes: `#/home #/library #/playlist/<id> #/lesson/<id> #/start #/about #/mission #/sheikh #/favs`.
- No network fetches except same-origin relative paths (captions/transcripts). No external URLs anywhere.
- `prefers-reduced-motion`: keep animations transform/opacity only; core adds a global kill switch, but design yours to be safe.

## Files you may write
- ONLY under `~/workspace/archive-rebuild/src/css/track-<name>.css`, `src/html/track-<name>.html`, `src/js/track-<name>.js`
- Splash track may also write `~/workspace/archive-rebuild/build/Preview/assets/img/sunset.svg` and must reference it in HTML/CSS as `Preview/assets/img/sunset.svg`
- Read-only elsewhere. Never touch `~/workspace/archive-baseline/`.

## Speed rules
- One solid pass. Clean, working code. Do not chase perfection; fix what is clearly broken.
- Report back: files written + any judgment calls + anything you could not verify.
