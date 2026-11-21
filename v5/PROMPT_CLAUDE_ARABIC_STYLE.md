# Claude Code — scoped job: V4 Arabic style + verify the three artifact fixes

One item only. Nothing else.

## The job
1. Restore the V4 Arabic writing style and background calligraphy in the V5 library. The owner reports: in V4 the Arabic writing style is different (better) and the background calligraphy is beautiful; the latest version lost it. Compare V4 against the current build and restore what V4 had. Do not redesign anything else.
2. Verify the three fixes that just landed in the published artifact, and apply the same behavior in `v5-prototype/src/` if missing:
   - Entry page (Enter as Guest / sign in with email) shows on EVERY visit, never skipped.
   - Video and playlist thumbnails come from the YouTube video ID (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`), not from local offline-archive files.
   - The section divider banner animates (draws itself) when it scrolls into view, never a static line.

## Work dir and sources
- Work dir: `~/workspace/archive-rebuild/`
- Source to edit: `v5-prototype/src/` (app.js, app.css, body.html, content.json, assets/).
- V4 reference: `v4/src/` (seeded copy) and `archive-rebuild-v4.zip`.
- Do not touch catalog data, books, login logic, or playback. Do not touch `v5/src/` (old Claude partial) or the artifact's files.

## Rules (standing, from AGENTS.md)
- Pre-flight is done: BRIEF_V5.md and src/app.js are readable. Do not re-check.
- One item per session. Only the context this item needs.
- If you hit the 5-hour cap, stop immediately and report where you stopped. Do not burn the session on council, review, or design-voice work. Building only.
- Verify by serving the build and checking with curl (HTTP). Run behaviour/screenshot tests only if the browser actually starts.

## Report back
What changed (file list), verification results for each of the four points above, and anything still open.
