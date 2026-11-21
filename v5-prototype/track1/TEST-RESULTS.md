# TRACK 1 TEST RESULTS — verified firsthand by the track coordinator (not by the builder)

Date: 2026-11-21 (UTC). All runs below were executed by me, in this session, against the files Codex wrote.

## Item 1 — audit (Codex session A2, exit 0)
- `python3 audit/audit_catalog.py` — exit 0. Reproduces: app 4,320 / TSV 4,332 / TSV-only 13 / app-only 1 / reconciled 71 playlists, 3,977 unique video IDs, 4,320 occurrences / Bukhari 1,128 occurrences, 996 unique IDs.
- `python3 -m unittest test_audit_catalog.py` (in audit/) — 2 tests, OK.
- `node` check of `catalog-reconciled.js` vs `.json` — identical DATA (Codex ran it; I re-verified by deep-comparing reconciled JSON against v4 DATA: identical, `True`).
- Spot checks: `unresolved_ids.csv:21` reads `tp6k1bO6nkw,removed_tos,unrecoverable` (matches report). `1zRVE2yomk4` is in DATA.videos with the reported title, uploadDate 2026-10-17, playlistIds `PLXKSrZvHoN9f0e4ZoRV50x02TzfIzZLRR`, and absent from that playlist's TSV. Inventory date 2026-10-15 confirmed in INVENTORY_SUMMARY.md.
- Phrase check: "135 missing lessons" appears in no file under `audit/`.
- Counts arithmetic closes: 8 playlist deltas (+1+1+1+1+2+1+3+2 = +12 net) = 13 TSV-only − 1 app-only.

## Item 9 — guard (Codex session B2, exit 0)
- `python3 guard/network_guard.py guard/fixtures/bad-remote-asset.html` — exit 1 (2 violations).
- `python3 guard/network_guard.py guard/fixtures/bad-malformed-link.html` — exit 1 (4 violations).
- `python3 guard/network_guard.py guard/fixtures/good-clean.html` — exit 0.
- `python3 -m unittest test_network_guard.py` (in guard/) — 6 tests, OK.
- `python3 guard/network_guard.py v4/build/Preview/` — 2 violations: donation URL at `archive.html:965` and `catalog.js:3`. Matches the report.

## Item 10 — render (Codex session C2, exit 0)
- `node --check render/chunked-render.js` — OK.
- Module inspected: `renderChunked({container, items, renderCard, cap=1500, chunkSize=100})`, `aria-live="polite"` status, "Show more" button, append-only logic.
- Harness results as reported (100 initial / 3,977, 39 Show-more, 77 final batch, append-only by node identity, empty/short/custom-cap cases pass) — verified from RENDER-REPORT.md; the DOM harness itself ran under Codex with a parse5 shim, not re-run by me.
- NOT verified: native keyboard activation and screen-reader announcements (Chromium failed to start in this VM). Recorded as open.

## Infrastructure findings (firsthand)
- `codex exec` with a prompt argument hangs on stdin in this environment ("Reading additional input from stdin..."). Fix: pipe the brief via stdin (`codex exec - < brief.md`).
- `codex exec` refuses to run outside a git repo ("Not inside a trusted directory") unless `--skip-git-repo-check` is passed. The workspace is not a git repo.
- Default `codex exec` sandbox is read-only: file writes fail with "Read-only file system". Fix: `-s workspace-write`.
- First Codex run: A aborted at 17 s (`turn_aborted`, "interrupted on purpose", exit 101, no files); B and C completed analysis but wrote nothing (read-only sandbox). Relaunch with `-s workspace-write` fixed B and C; A2 completed cleanly on relaunch.
- Codex sessions used: A2 41,594 tokens; B2 76,637 tokens; C2 51,197 tokens (per session reports). PONG probe 11,010 tokens.
- No files were written outside `v5-prototype/audit/`, `guard/`, `render/`, `track1/` by this track. `v5/`, `v4/`, media, and Qwen's `build.py` untouched.
