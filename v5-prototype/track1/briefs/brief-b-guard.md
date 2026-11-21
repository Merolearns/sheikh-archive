# BRIEF B — Item 9: Network guard (Codex, mechanical)

You are Codex, the mechanical/consistency builder on the V5 prototype track of the Sheikh Moustafa Kamel offline video library. Claude Code is capped until 11:10 PM PST; this is a PROTOTYPE. Work only inside `/home/hatch/workspace/archive-rebuild/v5-prototype/guard/`. NEVER touch `/home/hatch/workspace/archive-rebuild/v5/`, `/home/hatch/workspace/archive-rebuild/v4/`, or any media files. Read-only access to everything else named below.

## Skills — load and follow first
Read these skill files and apply them to this item (paths are on disk):
- `/home/hatch/.claude/skills/security-and-hardening/SKILL.md`
- `/home/hatch/.claude/skills/prove-it-can-fail/SKILL.md` (the guard must be PROVEN to fail on bad input, not just asserted)
- `/home/hatch/.claude/skills/test-driven-development/SKILL.md`
- `/home/hatch/.claude/skills/python-code-review/SKILL.md`

## Spec
`/home/hatch/workspace/archive-rebuild/BRIEF_V5.md`, item 9 (network guard + zero-external-request recheck) and item 13 (in-page YouTube playback is an explicit user-initiated exception; local mode must still show zero external requests).

## Inputs (read-only reference)
- Clean-app reference: `/home/hatch/workspace/archive-rebuild/v4/build/Preview/` (`archive.html`, `catalog.js`, `archive_server.py`, `assets/`). Read to learn what a clean offline app looks like.
- Known fact: one literal HTTPS URL already exists in a catalog title (a donation-video title), so the guard must scan catalog text too, not only extracted UI text. The claim is "zero runtime external requests", never "zero literal URLs in the artifact".

## Task
1. Write `network_guard.py` (Python standard library only) that scans a target directory of HTML/JS/CSS and FAILS (non-zero exit, named violation, file + line) on any external URL except the narrow allowlist below. It must detect:
   - Remote `src`/`href` on img/script/link/iframe/video/audio/source/embed.
   - `preconnect`, `prefetch`, `dns-prefetch`, `preload` of remote origins.
   - `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `import(` to external hosts.
   - External URLs inside catalog/data text (scan string literals in JS and text in HTML), with the known catalog-title URL reported as a violation to be dispositioned, not silently passed.
   - Malformed YouTube links (wrong host, wrong/missing 11-char video ID, extra params that change the destination).
   - ALLOWLIST (only these pass): `https://www.youtube.com/watch?v=<11-char ID>` and `https://www.youtube-nocookie.com/embed/<11-char ID>` as lesson anchors, and ONLY where they appear as plain `<a href>` lesson links or inside the YouTube-playback mode code path. Any YouTube iframe/embed found outside a clearly marked YouTube-playback mode section is a violation.
2. Fixtures under `guard/fixtures/`:
   - `bad-remote-asset.html` — a page with an injected remote asset (e.g. remote `<img>` + `<script src>`). Guard MUST fail on it.
   - `bad-malformed-link.html` — a page with a malformed YouTube link (bad host and bad ID variants). Guard MUST fail on it.
   - `good-clean.html` — a page with only local assets + one valid YouTube lesson anchor. Guard MUST pass it.
3. Write `GUARD-REPORT.md`: the allowlist, each rule, the fixture results (pass/fail with exit codes), the result of running the guard against `/home/hatch/workspace/archive-rebuild/v4/build/Preview/` (list every violation found there, including the catalog-title URL, with disposition), and the item-13 exception scoping note (YouTube player allowed ONLY inside YouTube-playback mode; local mode zero external requests).
4. Write a small test (`test_network_guard.py`, stdlib unittest) asserting the three fixture outcomes and the allowlist regex behavior.

## Hard rules
- Never silently pass a violation. Every external URL found is either allowlisted by rule (named in the report) or a failure.
- Do not edit any file outside `v5-prototype/guard/`.
- Do not touch media files.

## Acceptance
- `python3 network_guard.py guard/fixtures/bad-remote-asset.html` exits non-zero with a named violation.
- `python3 network_guard.py guard/fixtures/bad-malformed-link.html` exits non-zero with a named violation.
- `python3 network_guard.py guard/fixtures/good-clean.html` exits 0.
- `python3 -m unittest test_network_guard.py` passes.
- `GUARD-REPORT.md` records the v4 Preview scan result honestly.

## Report back (short)
What was checked, what passed, what failed, with file paths and counts.
