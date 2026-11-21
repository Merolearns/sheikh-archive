# Claude Code decision — V5 consultation (Sheikh Moustafa Kamel offline video library)

## STATUS: NO DECISION — CLAUDE CODE UNAVAILABLE (SESSION LIMIT)

This file records a failure, not a verdict. **No decision below is Claude Code's decision, and none of it may be presented as one.**

### What happened

- Binary verified present: `~/.claude-npm/bin/claude`, version 2.1.318.
- READY probe run twice from `~/workspace/archive-rebuild` (project `.claude/settings.json` carries `permissions.allow`, including Write/Read/Bash; running as root, so `--dangerously-skip-permissions` was not used, per the root-mode rule).
- First probe (Fri Nov 20, 2026 ~15:13 PST): warned the workspace was untrusted (13 `permissions.allow` entries ignored). Trust was then set as instructed: `projects["/home/hatch/workspace"].hasTrustDialogAccepted: true` in `~/.claude.json`. (The project path `/home/hatch/workspace/archive-rebuild` was already trusted; the CLI wanted the `/home/hatch/workspace` entry.)
- Second probe (~15:14 PST): trust warning gone, but the CLI answered:

  > You've hit your 5-hour limit · resets 2:10am (UTC)

- Current time at probe: ~15:14 PST = ~23:14 UTC. Reset is at 02:10 UTC, about 3 hours later (Sat Nov 21, 2026 ~02:10 UTC / ~18:10 PST Fri Nov 20).
- No brief was sent, no decision was obtained, no decision was invented. The coordinator should decide on the majority of the answering voices, or re-dispatch this decision-taker after the limit resets.
- Re-probe at ~15:15 PST (23:15 UTC) confirmed the limit is still in force; reset remains 02:10 UTC.

### What was read before the probe (grounding, for the coordinator's use)

- Round-1 voices: `codex.md`, `deepseek.md`, `gemini.md`, `qwen.md`, `kimi.md`; `glm.md` (GLM silent, no credential, counts as absent).
- Council voices: `qwen-council.md`, `gemini-council.md`, `deepseek-council.md`. Codex-council and Kimi-council had not landed when this decision was briefed; they count as not-yet-answered.
- Grounding: `~/workspace/vetted-playbook.md` (§3.33 Roast Room discipline; §8 DO NOT list — nothing in the council replies re-vets or re-buys a §8 item), `~/workspace/archive-rebuild/BRIEF_V4.md`, `v4/DECISIONS.md`, `v4/TEST-RESULTS.md`, and the research reports under `~/workspace/research_notes/islamic-archive-*/report.md` (content-mapping report confirms the 7 NEEDS-OWNER-REVIEW playlists: rows 40, 44, 46, 51, 56, 69, 70; Friday sermons cited as both 368 and 387 in that report, so the figure is unit/source-sensitive until reconciled).

### Contested items and council tallies as briefed (for the coordinator to decide on)

These tallies are copied from the briefing, not decided here. Answering council voices: Qwen, Gemini, DeepSeek (3 of 5; Codex-council and Kimi-council not yet answered; GLM absent).

1. **V5 character: hardening release.** DeepSeek and Gemini agree; Qwen's council list leads with verification + reconciliation. Council leans hardening.
2. **Catalog reconciliation first.** TSVs as single source of truth, with unit labels (distinct videos vs memberships vs TSV rows). CAUTION: Gemini's "build script is dropping records" is an unproven inference (Codex found 13 TSV-only + 1 app-only occurrences); the reconciliation must establish the cause, not repeat the inference as fact.
3. **Owner-hardware verification matrix as a RELEASE GATE (DeepSeek) vs a top-ranked task.** DeepSeek upgraded it to a gate in council; Qwen ranks it #1 (score 5); Gemini ranks media preflight #2 (score 5).
4. **Dual playback placement: detail page only (DeepSeek, Qwen conceded) vs cards/rows/search/Saved too (Gemini holds; Kimi and Codex round-1 for cards).** Council tally: detail-only 2, cards 1.
5. **Missing local file: YouTube becomes primary (DeepSeek, Gemini conceded, Codex, Kimi in 404 state) vs local stays primary with YouTube as fallback (Qwen holds alone).** Council tally: YouTube-primary 2, local-primary 1.
6. **Books nav: NO 6th nav item (all three council voices agree). Books visibility: hide until an approved book exists (DeepSeek, Qwen conceded) vs show metadata early (Gemini).** Council tally: hide 2, show-early 1. Label collision ("المكتبة" taken by Library) still open: rename Library to "الدروس"/"الفيديوهات" (Qwen), "مؤلفات الشيخ" (Qwen), or "الكتب" as a secondary label only (DeepSeek). Note the threshold difference: Qwen council says hide until ">1 approved book exists"; DeepSeek round-1 says at least one approved book record and file.
7. **PDF reader: native browser reader with Open-file fallback — unanimous among the three council voices.** Adopt, WITH Gemini's fragile-consensus flag: the "Open in new tab" fallback must be tested on mobile Safari/Chrome before shipping.
8. **About fallback: omit/blank, no "under construction", no "غير متوفر" (unanimous).** Qwen's proposed static line ("الشيخ مصطفى كامل عالم ديني وداعية إسلامي معاصر") needs owner approval and a publishable source before it can ship — still to be ruled on.
9. **Virtualized lists: reject (unanimous; v4 chunked rendering + 1,500-card soft cap stands).**
10. **Arabic grammar sub-track from the memorization program (Kimi): defer pending owner verification (DeepSeek 1, Gemini 3 hold-for-owner).**
11. **"Total years" archive stat: drop (Gemini dropped it, DeepSeek rejects it as unverified).** Note: v4 source (`v4/src/app.js`) also carries a "years of publishing" stat label; the verdict should rule on that stat too, and on Gemini's "hours if they can be summed" (durations as a data field were not established).
12. **"Dr." honorific: verify with owner/source before carrying forward (Codex, DeepSeek, Gemini agree).**
13. **Books in the preview flavor: metadata-only, never book binaries (unanimous).**
14. **The 7 NEEDS-OWNER-REVIEW playlists: block the V5 release on their signoff (Gemini) or treat as a scored item (DeepSeek score 5, Qwen round-1 5/5)?**
15. **Continue-watching/resume: only the per-video resume position is new (the rail exists in v4) — in or out of V5, and sequenced after real playback verification (DeepSeek)?**
16. **Search chunking / audio guard: restatements of v4; only the recitation-stop-on-YouTube-link case is new — include that edge case only.**
17. **Arabic copy: Qwen's proposed strings ("تشغيل الفيديو", "مشاهدة على يوتيوب", "الملف غير متوفر محلياً", "جرب المشاهدة عبر الإنترنت") — adopt as the brief's wording or send to the native-Arabic copy audit?**
18. **iOS/Safari `<video>` fullscreen behaviour (Qwen) — include in the verification matrix?**

### DEDUPLICATION RULE (owner instruction, Nov 20 — REQUIRED step in the V5 build)

The owner is about to share material the Sheikh himself sent him (books / biography material). **Every incoming item must be checked against what is ALREADY in the library before it is listed anywhere. No duplicate books, no duplicate bio facts, no duplicate series. Any duplicate is flagged to the owner instead of being listed twice.** This is a required build step, not a nice-to-have, and it applies to the Books metadata and About copy items in the final V5 list.

**(a) Books — title and file matching.** Compare each incoming book against every book already in the library (and against other incoming books) on:
- Arabic title, normalized: strip diacritics (tashkeel), normalize alef variants (أ إ آ → ا), hamza variants, teh marbuta / heh, yeh / alef maksura, and punctuation; case-fold the English title; collapse whitespace.
- English title, same normalization (case, punctuation, whitespace).
- File name: exact file-name match, and normalized file-name match (same normalization, ignoring extension and separators such as `_`, `-`, spaces).
- Matching rules: **exact match** (identical after normalization) = duplicate; **normalized match** (titles match after normalization even if the raw strings differ) = duplicate; **same file name** = duplicate even if the title differs. Any of the three fires the duplicate flag.

**(b) Bio facts — About page and archive.** Compare each incoming bio fact (teacher name, degree, date/period, position/role, institution, ijaza grantor/subject) against what is already on the About page and what is derivable from the archive:
- Teachers and ijazat: normalized name match (same Arabic normalization as above) plus subject/text match where given.
- Degrees/institutions/dates/positions: normalized institution + degree + year match; a fact already stated on the page (even in different wording) is a duplicate.
- Matching rules: **exact match** on the normalized fact = duplicate; **normalized match** (same person/institution/date under a spelling or wording variant) = duplicate; a fact already implied by an archive-derived stat on the page = duplicate. Near-matches that cannot be resolved (e.g. same name, different dates) go to the owner review list as "possible duplicate — needs owner ruling", never onto the public page.

**(c) Series / playlists — video ID and title.** Compare each incoming series against the existing 71 playlists and 3,977 catalog entries:
- **Same video ID**: any incoming video whose YouTube video ID already exists in the catalog is a duplicate entry, even under a different title.
- **Normalized title match**: playlist/series titles normalized as in (a); a normalized title match against an existing playlist = duplicate series.
- Matching rules: **exact match** (same video ID, or identical normalized title) = duplicate; **normalized match** (title matches after diacritic/alef/hamza/punctuation normalization) = duplicate. A series whose videos are all already in the catalog under another playlist is flagged as a duplicate series even if its title differs.

**Where duplicates go.** Duplicates NEVER go on the public page, the Books list, the About page, or any series rail. They go to an **owner review list** (internal, build-time): each entry records the incoming item, the existing item it matches, the matching rule that fired (exact / normalized / same video ID / same file name), and the disposition (owner confirms it is the same item, owner confirms it is distinct, or owner merges them). Nothing on that list ships until the owner rules on it. The build must fail or warn (not silently list) when an unreviewed duplicate is present in supplied material.

**Scope note.** This rule also governs the Books metadata and About copy items in the final V5 list: no book record and no bio sentence enters the public build until it has passed the dedup check above. It does not change the three decided owner requirements; it constrains how supplied material enters them.

### Hard constraints (carried, undecided items notwithstanding)

Planning only; no app/v4/voice file was built or edited. Only Sheikh Moustafa Kamel prominent, no other scholars section. Fully offline-first, zero external requests at runtime in the installed app (YouTube is an explicit user-initiated link out, never an in-app embed or fetch). Recitation stays the CC0 file already bundled, never another recording, never AI audio. No em dash in any proposed UI copy. No AI credit lines. No purchases, no paid keys, no third-party clouds. No invented biography, book titles, contents, or file names; unknowns stay marked unknown. Never re-vet or re-buy a playbook §8 DO NOT item.

### Recommended next step for the coordinator

Decide the 18 items above on the majority of the three answering council voices (Qwen, Gemini, DeepSeek), adjudicating the splits (items 4, 5, 6, 14, 15, 17) and folding in any Codex-council / Kimi-council replies that land before the verdict is written — or re-dispatch this Claude Code decision-taker after the 5-hour limit resets (~02:10 UTC Sat Nov 21, 2026). Trust for the workspace is now set, so a re-dispatch should go straight to the READY probe. **Carry the DEDUPLICATION RULE above into BRIEF_V5 unchanged as a required build step**, including the owner review list for duplicates and the rule that unreviewed duplicates block listing, not silently ship.
