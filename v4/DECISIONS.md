# v4 decisions

Routine decisions made while building v4 (the voice edition). Binding spec: `BRIEF_V4.md` and the v4 improvement report with its track notes.

## Kept from v3 unchanged

- Catalog `DATA` reused verbatim (3,977 lessons, 71 playlists). `build.py` asserts the literal is byte-identical to v3's and deep-equal on parse.
- `archive_server.py` and both launchers are copied from v3 byte-for-byte (v3's server is v2's server). The build checks this.
- Opening choreography, verse text, theme picker, Calm toggle, About stat row, font stack: untouched except where an action below says otherwise.

## The 12 actions, as built

1. **Plurals.** One `count()` helper that uses `Intl.PluralRules("ar")` with all five Arabic forms (one, two, few, many, other) for lessons, series, results, minutes, hours, files. A second `word()` table gives the bare noun under a large numeral (stat rows, the minutes badge).
2. **Recitation.** `recitation.mp3` is the CC0 file from the research folder, copied as-is (no re-encode). It stays silent until the reader presses Enter (or play in the footer bar). Escape/skip never starts it. The footer has play/pause, replay, mute and volume. Starting a lesson video stops and rewinds it, and pressing play on it pauses the video, so the two never overlap. The English Credits line is the provenance doc's attribution sentence word for word. The Arabic line carries the same facts.
3. **Scholars.** The home Scholars section is removed completely, with no copy explaining the absence. The Bayoun Aqeeda playlist (`PLXKSrZvHoN9dOyWCCK6Qm8AS4blW3Ylwm`) remains a normal series card under Beliefs, in search and at its direct URL, with his name as the byline.
4. **Motion.** Staggered card entrances, rail dividers that draw once as they scroll in, View-Transition page changes, FLIP filtering, and the Golden Thread bar in the transcript. Everything uses transform and opacity only. Calm and `prefers-reduced-motion` show the final frames with nothing running.
5. **390px.** The theme-picker panel and all 6 swatches fit on screen, and all 5 nav items show in full.
6. **Search no-results.** When no series match but lessons do, one message gives the lesson count, with "Show the matching lessons" as the primary action and "Browse the Library" as a quiet second one. The "0 results" counter is not shown in that state (see the fixes below).
7. **Error states.** The video element, captions and spinner are hidden and the stage shows a khatam emblem with the notice. The raw path stays inside a closed Details disclosure.
8. **Mark as watched.** A toggle button on the lesson page, stored with the other progress data. It can be undone and survives a reload.
9. **Patterns.** Placements from track E: player frame (draws once per session), framed prev/next cards, empty-state frames, the footer medallion, the stats-band girih, and dialog medallions. No lattice behind grids and no pattern in the transcript body (binding non-goals).
10. **Numerals.** Arabic-Indic digits throughout the Arabic UI, durations included. The lesson sidebar no longer shows a row index next to the catalog numbering, so each row has only one number.
11. **Hosting.** `CATALOG_VERSION` (a content hash) is emitted into both flavors at build time and shown in About > Library details. `docs/server-contract.md` lists every URL and header the page needs.
12. **Calm states.** A missing `videos` folder shows one calm, dismissible banner on the Library (not a red alert). When all 40 days are ticked, a quiet closing line appears with a "Start again" action.

## Fixes made during the screenshot review (session 5)

- **Empty-state class collision.** Empty states were tagged with the class `search`, which also styles the search bar. It added a 12px icon margin that pushed the corner and centre emblems off position on every screen, and on mobile it caused 7px of sideways overflow. Renamed to `e-search` / `e-saved`. No CSS rule used the old class.
- **Mobile corner size.** `.empty.framed>.corner .kh` (16px) was more specific than the mobile rule that shrinks corners to 12px. Added it to the mobile rule.
- **Prev/next frames.** The framed prev/next cards were missing `position:relative`, so their inner rule and corner stars anchored to the whole lesson info block and the title ran across the frame. One property added.
- **Lesson sidebar grid.** After the row index was dropped (action 10), the grid still had three columns, so the thumbnail sat in the 28px number column. The grid now has two columns, and the unused `.ulist .n` rule was deleted.
- **"0 results" beside "N lessons match".** The library header counted series even when none matched, which brought back the contradiction action 6 removes. The counter now appears only when there are series to count.
- **Two test bugs (not app bugs).** The Golden Thread test tapped cue index 2, but the sample transcript has only cues 0 and 1. The plural test raced a hash-only navigation. Both tests were fixed; the app was not changed for them.
