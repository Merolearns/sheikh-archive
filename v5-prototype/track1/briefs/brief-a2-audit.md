# BRIEF A2 — Item 1: Catalog reconciliation audit (Codex, mechanical) — RELAUNCH

You are Codex, the mechanical/consistency builder on the V5 prototype track of the Sheikh Moustafa Kamel offline video library. This is a RELAUNCH: the first attempt was interrupted after 17 seconds with no files written. You are running with sandbox mode workspace-write, so the workspace IS writable. If any write fails with "Read-only file system", report the exact path immediately and stop.

Work only inside `/home/hatch/workspace/archive-rebuild/v5-prototype/audit/`. NEVER touch `/home/hatch/workspace/archive-rebuild/v5/`, `/home/hatch/workspace/archive-rebuild/v4/`, `/home/hatch/workspace/archive-rebuild/v5-prototype/build.py` (another track's file), or any media files. Read-only access to everything else named below.

## Skills — load at most these three, one at a time, with your file-read tool (NOT a shell loop)
- `/home/hatch/.claude/skills/spec-driven-development/SKILL.md`
- `/home/hatch/.claude/skills/source-driven-development/SKILL.md`
- `/home/hatch/.claude/skills/test-driven-development/SKILL.md`
The full item-1 spec is inline in this brief. Do NOT re-read BRIEF_V5.md unless you need another item.

## Inputs (verified facts — recompute them, do not take them on trust)
- App DATA: `/home/hatch/workspace/archive-rebuild/v4/build/Preview/catalog.js` — `const DATA = {"playlists": [...], "videos": [...]}`. 71 playlists, 3,977 videos, 4,320 playlist memberships (sum of item lists == sum of `count` fields == 4,320). Bukhari playlist `PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0`: 1,128 items, 996 distinct IDs. Video entry shape includes `id`, `media`, `title`, `titleEn`, `order`, `playlistIds`, `uploadDate`, `duration`, `subtitles`.
- TSV inventory: `/home/hatch/workspace/youtube-archive/metadata/inventory/` — 71 `pl_entries_<PLAYLIST_ID>.tsv` files, 4,332 lines total, no header, columns: playlist_index, video_id, title. Plus `flat_playlists.tsv`, `flat_videos.tsv`, `flat_shorts.tsv`, `flat_streams.tsv`, `all_ids.txt`, `INVENTORY_SUMMARY.md`.
- Known gap: 4,320 app memberships vs 4,332 TSV rows; multiset join yields 13 TSV-only + 1 app-only occurrences. Bukhari: 1,131 TSV rows vs 1,128 app items.

## Task
1. Write `audit_catalog.py` (Python standard library only, replayable, deterministic) that parses the app DATA out of `catalog.js`, loads all 71 TSVs, joins by playlist ID comparing ORDERED occurrences of video IDs including repeated memberships, checks video existence in DATA.videos, enumerates EVERY discrepancy (the 13 TSV-only, the 1 app-only, the Bukhari delta, any per-playlist count mismatch), and for EACH determines the cause ON EVIDENCE (duplicate TSV row? stale/renamed entry? repeated membership the app deduped? video missing from DATA.videos? genuine omission?). TSVs are the reference baseline, but neither source is automatically authoritative per occurrence.
2. Emit the reconciled DATA: `catalog-reconciled.json` (full corrected DATA) and `catalog-reconciled.js` (same DATA as a `const DATA = ...` literal, same shape as `catalog.js`), plus `counts.json` with every count DECLARED WITH ITS UNIT (unique video IDs for archive totals; playlist occurrences only where presented as entries).
3. Write `AUDIT-REPORT.md`: one section per discrepancy with playlist ID, video ID, playlist_index, what each source says, evidence for the cause, resolution applied. Plus a counts table with units and sources.
4. Write `test_audit_catalog.py` (stdlib unittest) asserting the join reproduces 4,320 vs 4,332, the discrepancy enumeration is complete on re-run, and the reconciled DATA parses with membership total equal to the declared reconciled count. Run it; it must pass.

## Hard rules
- NEVER invent counts. Every number traces to a source file + row.
- The string "135 missing lessons" must NOT appear anywhere in any output file.
- Do not edit the v4 catalog or any file outside `v5-prototype/audit/`.
- Do not touch media files.

## Acceptance
- `python3 audit_catalog.py` exits 0 and prints the headline counts.
- `python3 -m unittest test_audit_catalog.py` passes.
- `AUDIT-REPORT.md` lists every discrepancy with evidence and a resolution; Bukhari reconciled with its delta explained.
- `catalog-reconciled.json` parses as JSON; `catalog-reconciled.js` parses as JS (same DATA).

## Report back (short)
What was checked, what passed, what failed, with file paths and counts. End with the reconciled headline counts and units.
