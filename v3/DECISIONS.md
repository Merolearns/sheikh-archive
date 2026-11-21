# v3 decisions

Routine calls made while building v3. Owner decisions 1 to 4 come from BRIEF_V3.md and are not repeated here except where a later review is owed.

## For later owner review

- **Sermons and occasions.** The 7 playlists the content-mapping report marked NEEDS-OWNER-REVIEW (أنشطة المسجد في الصيف, رمضان - العيد ٢٠٢١, English Lectures, خطب الجمعة, أحداث عامة, دروس العشاء, دروس السبت; titles copied from the catalog, inner spaces collapsed) sit in a "Sermons and occasions" collection outside the leveled path, as the brief directs. The UI never says they are waiting on anyone. Moving any of them into a pillar is a one-line change in `src/content.json`.
- **Day 36 of the 40 days.** The report names "الحلقة الثالثة عشر ... بعنوان الحياء". The catalog's lesson with that series, topic (الحياء) and duration (11m40s) is titled "الرابعة عشر". The catalog lesson is used (`qSM3-SMJS6E`); see `tools/resolve_content.py`.
- **English Lectures** is credited to "Guest speakers", because its lessons are by other speakers.

## Build and architecture

- **Two flavors, one shell.** `build.py` writes `Preview/archive.html` (catalog inlined, what the launchers open) and `Preview/archive-hosted.html` (loads `Preview/catalog.js?v=<version>`). The version is the first 12 hex of the catalog literal's SHA-256, also shown in About. Both ship in the ZIP; `docs/server-contract.md` says how to host the second.
- **Curation stays in the shell, not in catalog.js.** `catalog.js` holds only the v2 `DATA`, byte for byte. Pillar map, 40 days and first lessons are in `src/content.json`, generated from the report by `tools/resolve_content.py` (fails on any title or duration mismatch).
- **Server and launchers are copied from the v2 build, not edited.** `build.py` asserts byte equality on every run.
- **Asset and data URLs stay relative to the archive root**, as in v2: the server keeps the browser at `/`.

## UI fixes made during screenshot review

- Mobile lesson page was 485px wide on a 390px phone: its one-column grid used `1fr`, which grows to the widest unbreakable line. Now `minmax(0,1fr)`. The screenshot tool's overflow check missed this because mobile emulation widens `innerWidth` to fit the content; it now compares against the device width.
- Pillar cards: the large letter (خ, ق) ran into the title below. Glyph box height raised from 100px to 124px.
- Header items moved 1 to 2px vertically on a language switch (Latin and Arabic line boxes differ). Brand subtitle and nav links now have fixed heights.
- Transcript timestamps touched the line text in RTL. Lines are now flex rows with a 10px gap.

## Kept as found

- In English the page stays `dir="rtl"` with the chrome fixed; text blocks switch language and direction inside it. This is v2 behavior and the brief keeps it.
- Storage keys: `archive-favorites-v4` and `archive-progress-v4` unchanged so the owner's saved lessons and progress carry over; v2 settings keys reused; new v3 keys (`archive-v3-calm`, `-sort`, `-days`) are new names, never reused ones.
