# BRIEF B2 — Item 9: Network guard (Codex, mechanical) — RELAUNCH

You are Codex, the mechanical/consistency builder on the V5 prototype track of the Sheikh Moustafa Kamel offline video library. This is a RELAUNCH: the first attempt completed its analysis but wrote NO files because the sandbox was read-only. You are now running with sandbox mode workspace-write, so the workspace IS writable. If any write fails with "Read-only file system", report the exact path immediately and stop.

Work only inside `/home/hatch/workspace/archive-rebuild/v5-prototype/guard/`. NEVER touch `/home/hatch/workspace/archive-rebuild/v5/`, `/home/hatch/workspace/archive-rebuild/v4/`, `/home/hatch/workspace/archive-rebuild/v5-prototype/build.py` (another track's file), or any media files. Read-only access to everything else named below.

## Skills — load at most these three, one at a time, with your file-read tool (NOT a shell loop)
- `/home/hatch/.claude/skills/security-and-hardening/SKILL.md`
- `/home/hatch/.claude/skills/prove-it-can-fail/SKILL.md`
- `/home/hatch/.claude/skills/test-driven-development/SKILL.md`

## Findings from run 1 (verified — reuse them, do not redo the scan from scratch)
- A static scan of the v4 Preview files found exactly TWO occurrences of the same external donation URL: `archive.html:965` and `catalog.js:3` — `https://us.mohid.co/ca/losangeles/wcis/masjid/online/donation/index/1`. Both are catalog-text violations, to remain flagged pending disposition.
- `fetch(` appears at `archive.html:2882, 2896, 3250, 3257, 3641` and the same lines in `archive-hosted.html`. Determine whether each is same-origin (local server) or external, and record the verdict per line.
- No YouTube iframe/embed exists in the v4 Preview files yet. Item 13 permits the YouTube player ONLY in user-initiated YouTube playback mode; local mode requires zero external requests.

## Task
1. Write `network_guard.py` (Python standard library only) that scans a target directory of HTML/JS/CSS and FAILS (non-zero exit, named violation, file + line) on any external URL except the narrow allowlist: `https://www.youtube.com/watch?v=<11-char ID>` and `https://www.youtube-nocookie.com/embed/<11-char ID>` as lesson anchors, and ONLY as plain `<a href>` lesson links or inside a clearly marked YouTube-playback mode code path. It must detect: remote `src`/`href` on img/script/link/iframe/video/audio/source/embed; `preconnect`/`prefetch`/`dns-prefetch`/`preload` of remote origins; `fetch(`/`XMLHttpRequest`/`WebSocket`/`EventSource`/`import(` to external hosts; external URLs inside catalog/data text; malformed YouTube links (wrong host, wrong/missing 11-char ID).
2. Fixtures under `guard/fixtures/`: `bad-remote-asset.html` (injected remote `<img>` + `<script src>`, MUST fail), `bad-malformed-link.html` (malformed YouTube link variants, MUST fail), `good-clean.html` (local assets + one valid YouTube lesson anchor, MUST pass).
3. Write `GUARD-REPORT.md`: the allowlist, each rule, the fixture results with exit codes, the result of running the guard against `/home/hatch/workspace/archive-rebuild/v4/build/Preview/` (list every violation, including the donation URL, with disposition), the per-line verdict on the `fetch(` occurrences above, and the item-13 exception scoping note.
4. Write `test_network_guard.py` (stdlib unittest) asserting the three fixture outcomes and the allowlist regex behavior. RUN the guard on all three fixtures and the v4 Preview dir, and RUN the tests. All must behave as specified.

## Hard rules
- Never silently pass a violation. Every external URL found is either allowlisted by rule (named in the report) or a failure.
- Do not edit any file outside `v5-prototype/guard/`.
- Do not touch media files.

## Acceptance
- Guard exits non-zero with a named violation on both bad fixtures; exits 0 on the good fixture.
- `python3 -m unittest test_network_guard.py` passes.
- `GUARD-REPORT.md` records the v4 Preview scan result honestly.

## Report back (short)
What was checked, what passed, what failed, with file paths and counts.
