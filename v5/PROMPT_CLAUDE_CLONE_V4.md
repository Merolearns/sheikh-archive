# Claude Code — job: clone V4 and do everything there (owner order, Nov 21 ~01:06 PST)

Owner order: "clone V4 and do everything that needs to be done there." The V4 look is the reference. Nothing V4 had gets lost.

## Step 1 — clone V4 (foundation, do this first)
- Copy `~/workspace/archive-rebuild/v4/src/` to a new working copy `~/workspace/archive-rebuild/v5-clone/src/` (copy only — never move, never edit `v4/src/`, never overwrite the v4 baseline or `archive-rebuild-v4.zip`).
- V4 reference files: `v4/src/` (app.css, app.js, body.html, content.json, assets/), `archive-rebuild-v4.zip`, `v4-preview/sheikh-library-v4-preview.html`.
- The clone keeps everything V4 had: the Arabic writing style, the background calligraphy, the animated section dividers, the opening verse treatment, the themes, the recitation.

## Step 2 — do everything on the clone
- Implement ALL of `~/workspace/archive-rebuild/BRIEF_V5.md` (items 1–15) on the clone: catalog reconciliation, dual playback (YouTube inside the same page, hosted copy as backup), Books section with the real downloaded books, About the Sheikh (verified bio only, real portrait), transcripts AR+EN readable in the browser, login page (Gmail sign-in + guest, per-account progress via Supabase), the 7 held-out playlists kept out of the curriculum path, accessibility + native-Arabic copy, network guard, chunked rendering, resume position, hosted parity.
- Books source: `~/workspace/archive-rebuild/v5/books-from-sheikh/` (65 WhatsApp files + Anta Tas'alu Vol 1 + Vol 2 with covers). Do not invent titles or contents.
- Bio source (verified, only source): `~/workspace/archive-rebuild/v5/sheikh-bio-source.txt`. No 2015 PhD year — the source gives no year for the doctorate. Teaching is past tense (pre-2003, Egypt); only the imamate is current.
- Portrait: `~/workspace/archive-rebuild/v5/sheikh-portrait.jpg` (his YouTube channel picture).
- Supabase: reuse the FILLED config from `~/workspace/archive-rebuild/v5-prototype/src/assets/supabase-config.json` by copying that file into the clone. Never ask the owner for keys or credentials.
- These three fixes (already landed in the published artifact v3) MUST be present in the clone: entry page shows on EVERY visit; thumbnails come from the YouTube video ID (`https://i.ytimg.com/vi/<id>/hqdefault.jpg`); section dividers animate when scrolled into view.
- Dedup rule: never list the same book/video twice; flag duplicates instead of listing them.

## Rules (standing, from AGENTS.md)
- Work item by item through the brief. If you hit the 5-hour cap, stop immediately and report exactly which items are done and where you stopped. Do not burn the session on council, review, or design-voice work. Building only.
- Verify with the full test suite (HTTP + behaviour + shots) before reporting anything done. A fix counts only when the live site proves it works.
- Report back: what changed (file list), verification results per item, and anything still open.

## Do NOT touch
- `v4/src/`, `archive-rebuild-v4.zip`, `v5/src/` (old Claude partial), the published artifact's files. Build output goes in `v5-clone/` only.
