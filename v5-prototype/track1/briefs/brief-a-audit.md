# BRIEF A — Item 1: Catalog reconciliation audit (Codex, mechanical)

You are Codex, the mechanical/consistency builder on the V5 prototype track of the Sheikh Moustafa Kamel offline video library. Claude Code is capped until 11:10 PM PST; this is a PROTOTYPE. If it works, Claude missed out; if not, Claude fixes details later. Work only inside `/home/hatch/workspace/archive-rebuild/v5-prototype/audit/`. NEVER touch `/home/hatch/workspace/archive-rebuild/v5/`, `/home/hatch/workspace/archive-rebuild/v4/`, or any media files. Read-only access to everything else named below.

## Skills — load and follow first
Read these skill files and apply them to this item (paths are on disk):
- `/home/hatch/.claude/skills/spec-driven-development/SKILL.md` (build exactly to the BRIEF_V5.md item 1 spec)
- `/home/hatch/.claude/skills/source-driven-development/SKILL.md` (every claim traced to a source)
- `/home/hatch/.claude/skills/test-driven-development/SKILL.md` (tests before/around the script)
- `/home/hatch/.claude/skills/debugging-and-error-recovery/SKILL.md` (root-cause each discrepancy)
- `/home/hatch/.claude/skills/python-code-review/SKILL.md` (review your own script before finishing)

## Spec
`/home/hatch/workspace/archive-rebuild/BRIEF_V5.md`, item 1. Catalog reconciliation — TSVs are the single source of truth.

## Inputs (verified facts — do not re-derive the headline counts from memory, recompute them)
- App DATA: `/home/hatch/workspace/archive-rebuild/v4/build/Preview/catalog.js` — `const DATA = {"playlists": [...], "videos": [...]}`. 71 playlists, 3,977 videos, 4,320 playlist memberships (sum of item lists == sum of `count` fields == 4,320). Bukhari playlist `PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0`: 1,128 items, 996 distinct IDs.
- TSV inventory: `/home/hatch/workspace/youtube-archive/metadata/inventory/` — 71 `pl_entries_<PLAYLIST_ID>.tsv` files, 4,332 lines total, no header, columns: playlist_index, video_id, title. Plus `flat_playlists.tsv`, `flat_videos.tsv`, `flat_shorts.tsv`, `flat_streams.tsv`, `all_ids.txt`, `INVENTORY_SUMMARY.md`.
- Known gap: 4,320 app memberships vs 4,332 TSV rows; multiset join yields 13 TSV-only + 1 app-only occurrences. Bukhari: 1,131 TSV rows vs 1,128 app items.

## Task
1. Write `audit_catalog.py` (Python standard library only, replayable, deterministic) that:
   - Parses the app DATA out of `catalog.js` and loads all 71 TSVs.
   - Joins by playlist ID and compares ORDERED occurrences of video IDs, including repeated memberships; also checks video existence in DATA.videos, and flags TSV rows whose video ID is absent from DATA.videos and vice versa.
   - Enumerates EVERY discrepancy: the 13 TSV-only occurrences, the 1 app-only occurrence, and any others the join finds (including the Bukhari 1,131 vs 1,128 delta and any per-playlist count mismatches).
   - For EACH discrepancy, determines the cause ON EVIDENCE (do not assume a build-script parse bug): check whether the TSV row is a duplicate row, a stale/renamed entry, a repeated membership the app deduped, a video missing from DATA.videos, or a genuine omission. TSVs are the reference baseline, but neither source is automatically authoritative per occurrence.
   - Emits the reconciled DATA: `catalog-reconciled.json` (full DATA: playlists + videos, corrected) and `catalog-reconciled.js` (same DATA as a `const DATA = ...` JS literal, same shape as `catalog.js`), plus `counts.json` with every count DECLARED WITH ITS UNIT (unique video IDs for archive totals; playlist occurrences only where presented as entries; per-playlist entries; durations only if a duration field exists — do not compute durations from nothing).
2. Write `AUDIT-REPORT.md`: one section per discrepancy with playlist ID, video ID, playlist_index, what each source says, the evidence for the cause, and the resolution applied. Plus a counts table with units and sources.
3. Write a small test (`test_audit_catalog.py`, stdlib unittest) asserting: the join reproduces 4,320 vs 4,332; the discrepancy enumeration is complete (no unlisted diffs on re-run); the reconciled DATA parses and its membership total equals the declared reconciled count.

## Hard rules
- NEVER invent counts. Every number traces to a source file + line/row.
- The string "135 missing lessons" must NOT appear anywhere in any output file. (It is false as a membership audit: incompatible units.)
- Do not edit the v4 catalog or any file outside `v5-prototype/audit/`.
- Do not touch media files.

## Acceptance
- `python3 audit_catalog.py` exits 0 and prints the headline counts.
- `python3 -m unittest test_audit_catalog.py` passes.
- `AUDIT-REPORT.md` lists every discrepancy with evidence and a resolution; Bukhari reconciled with its delta explained.
- `catalog-reconciled.json` parses as JSON; `catalog-reconciled.js` parses as JS (same DATA).

## Report back (short)
What was checked, what passed, what failed, with file paths and counts. End with the reconciled headline counts and units.
