# TRACK 1 HANDOFF — Codex mechanical track (items 1, 9, 10) → build integration

## What this track delivered (all verified firsthand — see track1/TEST-RESULTS.md)

### Item 1 — Catalog reconciliation (audit/)
- `audit/audit_catalog.py` — replayable audit script (stdlib only). Re-run: `python3 audit_catalog.py`.
- `audit/AUDIT-REPORT.md` — every discrepancy with evidence + resolution.
- `audit/catalog-reconciled.json` + `audit/catalog-reconciled.js` — the reconciled DATA.
- `audit/counts.json` — every count with its unit and source.
- `audit/test_audit_catalog.py` — 2 tests, pass.

**Reconciled headline counts (declared units):** 3,977 unique video IDs; 71 playlists; 4,320 playlist occurrences. Bukhari: 996 unique video IDs across 1,128 playlist occurrences.

**Key finding: the reconciled DATA is IDENTICAL to the v4 DATA** (deep-equal, verified). The 12-entry net gap resolves as: 13 TSV-only occurrences across 10 distinct IDs, each recorded in `unresolved_ids.csv` as unrecoverable (removed_tos, removed_hate_speech, removed_by_uploader, removed_violent_graphic, livestream_lost, duplicate — including 3 in Bukhari at indexes 0074, 0100, 0466) → excluded; 1 app-only occurrence (`1zRVE2yomk4`, playlist record 51, upload date 2026-10-17, after the 2026-10-15 inventory snapshot) → retained. 8 playlists have count deltas (+1, +1, +1, +1, +2, +1, +3, +2 = +12 net). No counts were invented; the string "135 missing lessons" appears nowhere.

**Also surfaced (not in the brief's headline gap):** 37 app video IDs are absent from the public inventory (`all_ids.txt` + flat tab TSVs) vs 3,940 public IDs. The audit used catalog metadata only and did NOT inspect media files — media availability for those 37 is unverified.

### Item 9 — Network guard (guard/)
- `guard/network_guard.py` — build-time scanner (stdlib only). Usage: `python3 network_guard.py <target-dir>`.
- `guard/fixtures/` — bad-remote-asset.html (fails, 2 violations), bad-malformed-link.html (fails, 4 violations), good-clean.html (passes).
- `guard/test_network_guard.py` — 6 tests, pass.
- `guard/GUARD-REPORT.md` — rules, allowlist, fixture results, v4 scan, all 10 `fetch()` call sites verified same-origin, item-13 exception form.

**Open disposition (owner decision needed):** the donation URL `https://us.mohid.co/ca/losangeles/wcis/masjid/online/donation/index/1` appears in catalog text at `archive.html:965` and `catalog.js:3`. The guard flags it. Either remove it from catalog text or explicitly allowlist it with a recorded reason. Until then, any build step running this guard on the assembled app FAILS.

### Item 10 — Chunked rendering (render/)
- `render/chunked-render.js` — dependency-free `renderChunked({container, items, renderCard, cap=1500, chunkSize=100})`, append-only, accessible "Show more" button + live status.
- `render/test-chunked-render.html` — offline harness (synthetic 3,977 items; no real catalog copied).
- `render/RENDER-REPORT.md` — measured: 100 initial cards, 39 Show-more activations to reach all 3,977, 77 in final batch, append-only by node identity, empty/short/custom-cap cases pass.
- `render/INTEGRATION.md` — exact wiring: v4 `app.js` `mountList` (:1022, already 1,500-capped for video results via `renderLibrary` :1732); the pillar branch (:1704) renders `seriesCard` directly and is the gap; script placement in `build.py` `shell()` (:72) after catalog/curation, before inline `app.js`.

**Unverified:** native keyboard activation and screen-reader announcements (Chromium failed to start in this VM; DOM-check only). Needs the live-agent browser pass.

## Integration into build.py (Qwen track owns v5-prototype/build.py — DO NOT edit it from this track)
1. **DATA source:** point the catalog literal at `audit/catalog-reconciled.js` (or `.json`) instead of v4's `archive.html`. Today the DATA is identical, so output is unchanged — but the wiring must exist so future reconciliations flow through. Update the stale "v3" assert messages while there.
2. **Guard step:** run `guard/network_guard.py` on the assembled `build/Preview/` as a build step; fail the build on violations. Blocked until the donation-URL disposition above is decided.
3. **Render wiring:** inline `render/chunked-render.js` per `render/INTEGRATION.md` and route the pillar branch through it. Button/status strings still need wiring into the app's locale handling (currently English only).
4. **Counts in build.py:** its hardcoded asserts (3,977 media entries, 71 playlists, 4,320 memberships) already match the reconciled counts — no change needed, but they should assert against `audit/counts.json` rather than literals.

## What remains for Claude's fix pass
- Review the 14 audit resolutions (above) and sign off the reconciled DATA.
- Decide the donation-URL disposition (remove vs allowlist).
- Wire items 1–3 above into `build.py`; run the full prototype build; re-run guard + tests.
- Live-agent browser pass (item 2 gate): native keyboard + screen-reader check for the renderer; zero-external-request runtime check in local mode; real MKV playback; owner-hardware matrix.
- Media-availability check for the 37 app videos outside the public inventory.
