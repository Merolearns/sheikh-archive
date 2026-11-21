# BRIEF C — Item 10: Chunked rendering + 1,500-card soft cap (Codex, mechanical)

You are Codex, the mechanical/consistency builder on the V5 prototype track of the Sheikh Moustafa Kamel offline video library. Claude Code is capped until 11:10 PM PST; this is a PROTOTYPE. Work only inside `/home/hatch/workspace/archive-rebuild/v5-prototype/render/`. NEVER touch `/home/hatch/workspace/archive-rebuild/v5/`, `/home/hatch/workspace/archive-rebuild/v4/`, or any media files. Read-only access to everything else named below.

## Skills — load and follow first
Read these skill files and apply them to this item (paths are on disk):
- `/home/hatch/.claude/skills/performance-optimization/SKILL.md`
- `/home/hatch/.claude/skills/test-driven-development/SKILL.md`
- `/home/hatch/.claude/skills/webapp-testing/SKILL.md`
- `/home/hatch/.claude/skills/code-review-and-quality/SKILL.md` (review the module before finishing)

## Spec
`/home/hatch/workspace/archive-rebuild/BRIEF_V5.md`, item 10: chunked rendering + 1,500-card soft cap in all-videos and large pillar views, with an accessible "Show more" action. No virtualization library.

## Inputs (read-only reference)
- Existing rendering code: `/home/hatch/workspace/archive-rebuild/v4/src/app.js` — find the current chunked-rendering implementation and how cards are built; your module must match its card shape and calling conventions so it drops in.
- Catalog shape: `/home/hatch/workspace/archive-rebuild/v4/build/Preview/catalog.js` — `DATA = {"playlists": [...], "videos": [...]}` (3,977 videos). Read a small slice for the test harness; do not copy the whole catalog anywhere.

## Task
1. Write `chunked-render.js` — a standalone, dependency-free (no libraries, no virtualization library) ES module (also usable as a plain script) exposing a `renderChunked` function:
   - Signature: `renderChunked({ container, items, renderCard, cap = 1500, chunkSize = 100 })`.
   - Renders the first chunk (at most `chunkSize` cards, never more than `cap` total on first paint), then appends an accessible "Show more" `<button>` (real button element, `aria-controls` pointing at the list, `aria-live="polite"` status text announcing how many shown / how many remain).
   - Each "Show more" activation appends the next chunk WITHOUT re-rendering existing cards (append-only; prove this in the test by stamping rendered cards and asserting their nodes are not replaced).
   - When all items are shown, the button is removed and the status text says so. All matches remain reachable (no item is ever dropped by the cap — the cap limits the initial paint, not the data).
   - Handles empty lists (status text, no button) and lists smaller than one chunk.
2. Write `test-chunked-render.html` — a small harness page that loads `chunked-render.js` plus a generated slice of items (generate the items in the page, e.g. 3,977 synthetic entries matching the catalog's card shape — do NOT paste the real catalog) and exercises: initial render count, Show-more appends, end state, empty state. It must be openable in a plain browser with no server and no network.
3. Write `RENDER-REPORT.md`: the module's contract, measured behavior from the harness (initial card count for a 3,977-item list, chunk size, Show-more steps to reach the end, append-only proof, keyboard/accessibility notes), and any deviation from the v4 app.js rendering conventions.
4. Write `INTEGRATION.md`: the exact v4 `app.js` functions/lines to wrap or replace (function names + line numbers you observed), and how the prototype `build.py` wires this module into the assembled prototype (script tag placement, call site).

## Hard rules
- No virtualization library, no external dependency, no network access in the module or harness.
- Do not edit any file outside `v5-prototype/render/`.
- Do not touch media files. Do not copy the real catalog into the render dir.

## Acceptance
- Opening `test-chunked-render.html` in a browser with a 3,977-item list shows at most 1,500 cards on first paint (and in practice one chunk of `chunkSize`).
- Clicking "Show more" appends the next chunk without replacing existing card nodes.
- The button is a real `<button>`, keyboard-focusable, with a live status region.
- `INTEGRATION.md` names real `app.js` functions/lines.

## Report back (short)
What was checked, what passed, what failed, with file paths and counts.
