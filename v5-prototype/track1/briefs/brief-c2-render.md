# BRIEF C2 — Item 10: Chunked rendering + 1,500-card soft cap (Codex, mechanical) — RELAUNCH

You are Codex, the mechanical/consistency builder on the V5 prototype track of the Sheikh Moustafa Kamel offline video library. This is a RELAUNCH: the first attempt completed its analysis but wrote NO files because the sandbox was read-only. You are now running with sandbox mode workspace-write, so the workspace IS writable. If any write fails with "Read-only file system", report the exact path immediately and stop.

Work only inside `/home/hatch/workspace/archive-rebuild/v5-prototype/render/`. NEVER touch `/home/hatch/workspace/archive-rebuild/v5/`, `/home/hatch/workspace/archive-rebuild/v4/`, `/home/hatch/workspace/archive-rebuild/v5-prototype/build.py` (another track's file), or any media files. Read-only access to everything else named below.

## Skills — load at most these three, one at a time, with your file-read tool (NOT a shell loop)
- `/home/hatch/.claude/skills/performance-optimization/SKILL.md`
- `/home/hatch/.claude/skills/test-driven-development/SKILL.md`
- `/home/hatch/.claude/skills/code-review-and-quality/SKILL.md`

## Findings from run 1 (verified — reuse them, do not redo the analysis from scratch)
- v4's `mountList` starts with a 1,500-card limit: `/home/hatch/workspace/archive-rebuild/v4/src/app.js:1022`. `renderLibrary` calls it for video results (`app.js:1732`), while the pillar branch renders `seriesCard` markup directly (`app.js:1704`) — the pillar branch is the gap: it does NOT go through the cap.
- Prototype `build.py` uses `shell()` for both HTML outputs (`/home/hatch/workspace/archive-rebuild/v5-prototype/build.py:72`). The renderer's classic script belongs after the catalog and curation scripts and before the inline `app.js`.
- Expected behavior with the requested defaults and 3,977 synthetic entries: 100 initial cards, 39 Show more activations, 77 cards in the last batch. Append-only node identity, keyboard activation, live announcements, and empty/end states remain UNVERIFIED — verify them now.

## Task
1. Write `chunked-render.js` — standalone, dependency-free (no libraries, no virtualization library) ES module (also usable as a plain script) exposing `renderChunked({ container, items, renderCard, cap = 1500, chunkSize = 100 })`: renders the first chunk (at most `chunkSize` cards, never more than `cap` total on first paint), then appends an accessible "Show more" `<button>` (real button, `aria-controls` on the list, `aria-live="polite"` status text with shown/remaining counts). Each activation appends the next chunk WITHOUT re-rendering existing cards (append-only). When all items are shown the button is removed and the status says so. All matches remain reachable. Empty list: status text, no button. Lists smaller than one chunk: no button.
2. Write `test-chunked-render.html` — harness page loading `chunked-render.js` plus GENERATED synthetic items (3,977 entries matching the catalog card shape — do NOT paste the real catalog) exercising initial count, Show-more appends, end state, empty state. Openable in a plain browser with no server and no network. Verify it with `node --check chunked-render.js` and, if node is available, a headless DOM check; otherwise verify by careful review and record the verification method honestly.
3. Write `RENDER-REPORT.md`: the module contract, measured behavior from the harness (initial card count for 3,977 items, chunk size, Show-more steps to the end, append-only proof, keyboard/accessibility notes), and any deviation from v4 app.js conventions.
4. Write `INTEGRATION.md`: the exact v4 `app.js` functions/lines to wrap or replace (use the verified line numbers above), and how the prototype `build.py` wires this module in (script tag placement after catalog/curation, before inline `app.js`).

## Hard rules
- No virtualization library, no external dependency, no network access in the module or harness.
- Do not edit any file outside `v5-prototype/render/`.
- Do not touch media files. Do not copy the real catalog into the render dir.

## Acceptance
- With a 3,977-item list the harness shows at most 1,500 cards on first paint (100 with default chunkSize).
- Clicking "Show more" appends the next chunk without replacing existing card nodes (verify, do not assert).
- The button is a real `<button>`, keyboard-focusable, with a live status region.
- `INTEGRATION.md` names real `app.js` functions/lines.

## Report back (short)
What was checked, what passed, what failed, with file paths and counts.
