# BRIEF V5 — the hardening edition

## Mission

Build v5 of the Sheikh Moustafa Kamel offline video library. v4 is installed and praised ("best one so far"). v5 is a HARDENING release: prove v4's claims on real hardware, fix the catalog truth gap, and add the three owner-decided surfaces (dual playback, Books, About) only as they close truth gaps, gated by verification. Hardening is bounded, not open-ended: freeze the data snapshot, resolve the exceptions, then implement the bounded requirements — hardening never becomes an unlimited veto over delivery (Codex council). The owner ordered: no questions, decide and deliver beautifully. This brief is the complete spec. It implements the team verdict in `v5/verdict-20261120.md` (independent round, council round, majority rule; Claude Code did not decide — session limit — so the majority of the answering voices decides).

## Base: start from v4

- v4 as shipped: `~/workspace/archive-rebuild/archive-rebuild-v4.zip` (or the v4 build dir under `~/workspace/archive-rebuild/v4/`). Reuse its catalog `DATA` only AFTER item 1 reconciles it; the reconciled DATA becomes v5's catalog. Keep the server and both launchers byte-identical unless an item below requires a change, in which case the change is listed explicitly and the old file gets a `.bak` backup first.
- Work ONLY inside `~/workspace/archive-rebuild/v5/`. Never touch media. Never touch the v4 build dir.
- Binding background: `~/workspace/archive-rebuild/BRIEF_V4.md`, `v4/DECISIONS.md`, `v4/TEST-RESULTS.md`, the five research reports under `~/workspace/research_notes/islamic-archive-*/report.md`, `~/workspace/vetted-playbook.md` (read first; never re-vet or re-buy a §8 DO NOT item), and `v5/verdict-20261120.md`.

## The 15 build actions (in priority order)

### 1. Catalog reconciliation — TSVs are the single source of truth. (Score 5; gate input)

**What:** reconcile the app DATA against the 71 playlist TSVs in `~/workspace/youtube-archive/metadata/inventory/`. Known gap: app DATA has 4,320 memberships vs 4,332 TSV rows; multiset join yields 13 TSV-only occurrences and 1 app-only occurrence. Bukhari: 996 distinct app IDs across 1,128 app memberships vs 1,131 TSV rows across 999 distinct IDs. The content-mapping report itself cites both 368 and 387 for Friday sermons; treat that figure as unit/source-sensitive until reconciled.
**Where:** a replayable audit script plus the corrected DATA; every affected surface (series cards, playlist views, About, Where to Start, durations, sort order).
**How:** freeze the inventory snapshot first (a net delta of 12 hides offsetting differences). Join by playlist ID and compare ORDERED occurrences of video IDs, including repeated memberships, plus application references, TSV-only entries and their media availability. Establish the CAUSE of each discrepancy (do NOT assume a build-script parse bug; Gemini's "dropping records" is an unproven inference). Resolve each discrepancy on evidence: TSVs are the reference baseline, but neither source is automatically authoritative per occurrence — a TSV row can itself be stale or duplicated (Codex council). Explain intentional repeats. Record the approved source and count unit for every surface. Use unique video IDs for archive totals; count playlist occurrences only where they are presented as entries. Decide and document whether repeated videos contribute to series and curriculum durations. **Gemini's "135 missing lessons" is false as a membership audit (incompatible units) and must not appear anywhere.**
**Acceptance:** one replayable audit yields the approved counts and durations; all references resolve; every affected screen agrees with its declared unit; the 13 TSV-only + 1 app-only occurrences are each resolved and recorded. Until signed off, any visible number describes the current local catalog WITH its unit, and any claim of final archive coverage is withheld. Preserve existing media paths, video IDs, direct links, and saved state.

### 2. Owner-hardware verification matrix as RELEASE GATE. (Score 5)

**What:** a verification matrix run on the owner's real hardware and browsers. V5 does not ship until it passes, or a gap is documented as a known risk, never silently passed.
**Where:** a QA run recorded in `v5/TEST-RESULTS.md` (new file, same honest format as v4's).
**Checks (all required):**
- Real MKV playback with the owner's actual files: diverse codecs and sizes, play + seek + volume, on the owner's laptop.
- Audible recitation: default-silent, overlap behaviour with real videos in both directions, recitation stop on navigation and on user-initiated YouTube link-out. Audio output itself must be HEARD, not just read from media-element state.
- Windows `.bat` and macOS `.command` launchers run on their respective systems (path quoting, Python detection, working directory).
- Safari, Firefox, and Chrome real rendering and local-file behaviour; Arabic font rendering, especially Safari's fallback stack and diacritics.
- iOS/Safari `<video>` fullscreen behaviour (Qwen): does it break custom controls?
- All 65 v4 screenshots reviewed BY EYE (only ~12 were), plus every new v5 screen.
- Native-Arabic copy read by the owner or a native reader (see item 8).
- Real-host rendering of the hosted flavor (see item 12).
- Network egress recheck (see item 9).
- Drive present, absent, and disconnected; corrupt media; blocked autoplay; YouTube activation with no drive.
**Acceptance:** a signed-off checklist with OS/browser, sample video IDs, results, and actual audible behaviour recorded. Every unsupported browser/format combination or unrun check is explicitly marked.
**ZERO-ERROR STANDARD (owner order Nov 20, 2026 ~15:44 PST):** V5 ships only when every check in this matrix passes. No known flaw ships. Anything that fails is fixed and re-tested until it passes; the release never goes out with a workaround hiding a failure. `v5/TEST-RESULTS.md` records every check as pass/fail with evidence — nothing ships on "should work".
**TESTING METHOD (owner order Nov 20, 2026 ~15:44 PST):** test everything with the live agent team, thoroughly — not the builder checking its own work alone. Independent voices run the matrix: mechanical/consistency sweeps and guard checks (Codex strength), deep review and judgment (Claude Code strength), plus the other voices where they tighten the check. Every screen, every playback state, every language, every theme, every fallback path gets exercised live; anything found is fixed and re-tested by a different voice than the one that built it.

### 3. Dual playback, lesson detail page only. (Score 5)

**What:** every video gets two playback options on the lesson detail page. Cards, rows, search results, Saved, and playlist rows stay clean navigation surfaces (the card-level link is DEFERRED to a later version, not rejected).
**Where:** the lesson page, below the player, in the action area next to Save and Mark as watched. Same action order in both languages; 44px minimum target height; the action area stays mounted through loading and playback errors.
**Labels (PROPOSED wording, subject to the item-8 audit; the audit has final say):**
- Local: "تشغيل الفيديو" / "Play Video" (Qwen's proposal; Codex's "تشغيل محلي" / "Play locally" is the alternative for the audit to choose between).
- YouTube: "مشاهدة على يوتيوب" / "Watch on YouTube" (all voices agree).
- Internet note next to the YouTube link: "يفتح في علامة تبويب جديدة. يتطلب اتصالًا بالإنترنت." / "Opens in a new tab. Requires internet."
- Missing-file header: "الملف غير متوفر محلياً". Fallback action: "جرب المشاهدة عبر الإنترنت".
**Behavior (state machine):**
- Local file playable: local primary; YouTube secondary. Local keeps the v4 resume, captions, transcript, progress, and recitation behavior.
- Confirmed missing local file: the player shows the existing calm error treatment with a closed Details disclosure; the local action becomes plain status text ("الملف المحلي غير متاح" / "Local file unavailable"); YouTube becomes primary. Keep back navigation.
- File found but playback fails: keep the existing local-file action where appropriate; YouTube usable beside "Open in another player"; treat a failed availability probe as an unknown cause.
- Neither a local file nor a resolvable video ID: show an explicit unavailable state.
- Activation of the YouTube link: pause local playback, save any existing local position, stop recitation. YouTube viewing leaves local watch progress alone. The link stays usable without a drive, including before the media probe completes.
**Mechanics:** plain `<a href="https://www.youtube.com/watch?v=<VIDEO_ID>" target="_blank" rel="noopener noreferrer">`. No thumbnail fetch, no YouTube API, no preconnect/prefetch/fetch, no `navigator.onLine` gating, no availability checks, no auto-opening YouTube on local error. Video ID from the bracketed token in the media basename; a build-time regex match is required (`\[([A-Za-z0-9_-]{11})\]\.(mkv|mp4|webm)$`) and a mismatch blocks the build. Preserve ID case and the original path for local playback. A syntactically valid ID establishes the destination; YouTube controls availability. If the machine has no internet, the browser shows its own offline page; the app must not promise YouTube works offline.
**AMENDED by item 13 (owner order Nov 20, 2026 ~15:40 PST):** the primary YouTube mode is now an in-page player in the same tab and same site, not the new-tab link. The new-tab link stays as a secondary option. The "no embed" line above is superseded by the owner; see item 13 for the new mechanics.
**Acceptance:** both actions work on the detail page in both languages at 390px; the three states above each render correctly; clicking YouTube pauses local video, saves position, stops recitation, and opens a new tab; a sample of destinations smoke-tested without a drive with internet access; build fails on an ID mismatch.

### 4. Books section, hidden until ready. (Score 4)

**What:** a Books landing page for the Sheikh's books, linked secondarily from the Library header and the About page, labeled "الكتب". NO 6th nav item (the 5-item cap stands). The section stays hidden until at least ONE approved book exists WITH its readable file. No empty tabs, no forward-looking wording.
**Where:** list view (series-card grid pattern: cover or khatam emblem, Arabic title, English title if supplied, language badge, page count; lazy thumbnails; sort by owner-provided order, then Arabic title; filter by language only) → detail view (larger cover, metadata block, description, Read button) → offline reader.
**Reader:** the browser's native PDF viewer with an "Open file" / "افتح الملف" fallback. Do NOT require an iframe overlay if the OS/browser can open the approved local file more reliably offline. Bundled PDF.js is DEFERRED. EPUB is DEFERRED (convert to PDF or ship without it). Scanned PDF is accepted with documented limits; request a searchable source from the owner when available. Confirm page navigation, zoom, Arabic rendering, keyboard operation, and text search/selection for books supplied with a text layer. For other formats, confirm the offline reading path with a real sample before committing to a reader.
**Preview flavor:** metadata only, never book binaries. Show a note: "متاح في التطبيق المثبت" / "Available in the installed app". Books live in an installed `books/` folder.
**Search:** global search indexes book titles and metadata only. Full-text search needs an owner-supplied extracted text file per book; no AI OCR.
**Saved / Where to Start:** Saved stays video-only; books do not go on Where to Start.
**Dedup:** the dedup rule below applies to every incoming book before it is listed.
**Acceptance:** the supplied file matches the details, opens with networking disabled, preserves Arabic page order and legibility, and has a clear missing-file state. Test an actual approved file in each supported format. The native-reader "Open in new tab" fallback is tested on mobile Safari/Chrome before shipping (fragile-consensus flag).

**OWNER INPUT NEEDED — per book:**
- The actual readable file for each approved edition, with source filename and format. **Delivery route (owner order, Nov 20): the books arrive from the Sheikh's WhatsApp conversation via WhatsApp Web download, ~100 books expected; the build still needs the files + the metadata below, and the dedup rule applies to every one.**
- Exact display title in the source language; any owner-approved title for the other locale; book language.
- Confirmation of the Sheikh's role and the exact author/contributor credit as it should appear. If a book is not authored by Sheikh Moustafa Kamel, note the actual author; never invent it.
- Permission and intended scope for bundling and distributing each edition, including separate approval for any hosted copy and any required credit.
- Owner-approved edition, year, publisher, and description when available. Cover image + its permission only if the owner wants it shown. Omit absent optional fields.
- Ordering index; scan flag (true if the PDF is image-only); optional plain-text/OCR file if full-text search is wanted; category or pillar mapping (optional; default none).

### 5. About the Sheikh, verified facts only. (Score 4)

**What:** extend the existing About the Sheikh tab and keep its direct route. Use the Sheikh's main YouTube channel picture (owner-approved Nov 20, 2026 — it replaces the calligraphic monogram), approved bilingual name, archive role, archive-derived stats (with units, see below), and the linked index of his teaching. Link the approved Books list once populated.
**Rules:** every biography sentence needs its exact claim, its publishable source or approved first-person account, and owner approval of the Arabic and English wording. Teachers and ijazat are published ONLY when the person, subject or text, and nature of the study or authorization can be stated precisely from evidence. Birthplace, early background, credentials, affiliations, and any other unsupported details stay marked unknown in the editorial record and are OMITTED from the page. Unknown sections are omitted, never filled with forward-looking wording. No "under construction", no "غير متوفر", no "awaiting confirmation". The biography data field is either `null` or a final approved string; the build guard rejects any string containing awaiting, TBD, draft, placeholder, or "تحت المراجعة", and a rejected field is treated as `null` with the section omitted.
**Stats:** only what is computable from reconciled DATA with units (lessons, playlists, series). "Total years" and "years of publishing" are DROPPED unless the owner confirms the dated range with a source. Hours only if per-lesson durations verify as a data field (not established).
**"Dr." / "الدكتور":** verify with the owner and a publishable source before carrying it forward; omit until verified.
**Dedup:** the dedup rule below applies to every incoming bio fact before it is published.
**Acceptance:** the page shows only verified facts with sources on record; every unknown is omitted, not filled; the portrait is the Sheikh's main YouTube channel picture, approved by the owner Nov 20, 2026 — it replaces the monogram (decision recorded, picture saved locally under v5/assets/).

**OWNER INPUT NEEDED — About:**
- An approved, final biography paragraph or two, with permission to publish.
- A verified list of teachers and ijazat, or explicit instruction to omit them.
- Verified academic credentials and institutions, if any are to be shown.
- Portrait: DECIDED Nov 20, 2026 — the Sheikh's main YouTube channel picture; saved locally under v5/assets/ for the build (offline app, no hotlink). No further portrait input needed.
- Preferred subtitle/role line beyond the current name.
- Confirmation of the "Dr." honorific (with source).
- Ruling on the proposed static line "الشيخ مصطفى كامل عالم ديني وداعية إسلامي معاصر" (Qwen's wording proposal; needs owner approval and a publishable source before it can ship as a factual claim).
- The Sheikh's material itself (books/bio), subject to the dedup rule.

### 6. The 7 NEEDS-OWNER-REVIEW playlists. (Score 5; gates the curriculum)

**What:** the owner decides pillar/level/exclusion for the 7 flagged playlists: Friday sermons (خطب الجمعة), evening lessons (دروس العشاء), Saturday lessons (دروس السبت), English Lectures, community events (أحداث عامة), summer-camp clips (أنشطة المسجد في الصيف), Eid 2021 clips (رمضان - العيد ٢٠٢١).
**Where:** Where to Start and curated rails hold all 7 OUT of the curriculum until approved. Ordinary Library/search/direct access is retained throughout.
**Rules:** recommend leaving the three documentation collections outside the curriculum and allowing topic placement for mixed teaching only from reviewed titles or content. Review English Lectures attribution per item before featuring any as the Sheikh's work. No other-speaker listing or misleading Sheikh byline appears anywhere.
**Acceptance:** seven recorded owner decisions keyed by playlist ID; every approved placement resolves; V5 does not ship a curriculum placement for any of the 7 without his recorded decision.

**OWNER INPUT NEEDED — the 7 playlist decisions (one per playlist ID).**

### 7. Fix v4 audit leftovers. (Score 4 — verify first)

**What:** VERIFY FIRST in the rendered DOM on the owner's machine whether the Library sidebar shows duplicate rows ("All lessons 3,977" vs "Lectures 3,973"). Kimi's council grep found only ONE "All lessons" string (`lib_all`) in app.js and withdrew the duplicate-rows claim, so the duplicate may not exist. If the DOM check confirms two rows, merge them into one "All lessons" row; if it shows one, drop that sub-item with a note in TEST-RESULTS.md. Separately: fix mobile pillar-card meta wrapping; add match-field labels on search results (title/series/pillar); stabilize the search heading state; add recent searches from localStorage.
**Acceptance:** the sidebar state is established by direct DOM inspection and recorded; if a duplicate existed it is now one clean "All lessons" row; metadata does not wrap awkwardly; search results show why they matched; the heading updates correctly; recent searches persist offline.

### 8. Accessibility + native-Arabic copy audit. (Score 5 — raised from 4 by Codex council, Kimi round-1 5)

**What:** keyboard focus order across RTL nav, rails, grids, and player; visible focus rings; aria-labels on Save, YouTube, Mark as watched, and pillar chips; `prefers-reduced-motion` guard; contrast audit across all six themes; touch targets at least 44x44; screen-reader heading hierarchy; 390px and 200% zoom; Calm and reduced motion. A native Arabic reader signs off the new strings (dual playback, Books, About), numbers, plurals, mixed-direction text, and prior copy in affected flows. The item-3 proposed strings are the audit's input, not locked copy; the audit has final say (including the choice between "تشغيل الفيديو" and "تشغيل محلي").
**Acceptance:** manual or axe audit with zero critical errors; focus order matches visual flow; reduced-motion disables View Transitions and hero motion; native-reader sign-off recorded.

### 9. Network guard + zero-external-request recheck. (Score 5)

**What:** scope the external-URL guard exception NARROWLY to validated YouTube lesson anchors. Forbid remote embeds, assets, scripts, preconnect, prefetch, and fetch. Prove the guards fail by injecting a remote asset and a malformed link. Capture outgoing traffic with networking available and again with networking disabled; require zero requests outside the local archive. Recheck zero external requests on the final V5 build (ideally with an OS-level network monitor). **Guard scope correction (Codex council):** one literal HTTPS URL already exists in a catalog title (a donation-video title), so the build-time URL guard must scan catalog text too, not only extracted UI text — and the claim is "zero runtime external requests", never "zero literal URLs in the artifact".
**Acceptance:** injected remote asset and malformed link both fail the guard; final build shows zero requests outside the local archive; the only egress is the explicit user-initiated YouTube new-tab navigation.

### 10. Chunked rendering + 1,500-card soft cap enforcement. (Score 4)

**What:** enforce the v4 chunked rendering + 1,500-card soft cap in all-videos and large pillar views, with an accessible "Show more" action that loads the next chunk without a full re-render. Measure a cold open and broad, scoped, and empty queries on the owner's laptop. No virtualization library (rejected by all council voices).
**Acceptance:** the largest view renders no more than 1,500 cards initially; over 20 runs, aim for p95 of 200ms from input to painted results and at most 2s to the first usable Library view on the agreed reference setup. All matches remain reachable; old routes and saved state work; no per-card media probes run.

### 11. Per-video resume position — VERIFY existing v4 behavior, do NOT build it. (Score 3; verification, not new work)

**What:** per-video resume position ALREADY EXISTS in v4 (Codex council verified in source: `saveProgress` stores integer currentTime after five seconds, timeupdate saves about every four seconds, pause and pagehide save, resume=1 restores on loadedmetadata; the Continue rail also already exists). V5 does not build either. It verifies both on real playback as part of the item-2 gate, and wires the only new behavior: stopping recitation and saving position when the user activates the YouTube link (item 3).
**Acceptance:** position restores on a real video on the owner's laptop after item 2 passes; the Continue rail and per-video restore are regression-tested, not rebuilt.

### 12. Hosted parity smoke test. (Score 3)

**What:** render the real hosted flavor at its public entry URL on owner-controlled infrastructure, using the existing server contract. Verify matching HTML/catalog versions across updates, relative paths, Arabic URL encoding, MIME types, media and book byte ranges, real 404s, recitation, and YouTube link-outs. Check deployment permissions before uploading any book or media. **Owner order (Nov 20): he wants a real shareable website link he can tap, NOT an HTML download — the hosted flavor must be reachable at a tappable public URL; a file download does not satisfy this item.**
**HOSTING SHAPE + DOMAIN (owner question, Nov 20, 2026 ~15:45 PST):** the hosted site is the catalog + search + playlists + About + Books metadata, with in-page YouTube playback (item 13) — no video files and no book binaries are hosted (the 1.02 TB library stays in the installed app). Anyone online can browse everything and watch via YouTube; the installed app is the full offline version. No domain is chosen or bought yet (merolearns.com is taken/parked, per Nov 6 check — a fresh name is needed). Owner decisions needed: (1) the domain name; (2) where it is hosted (owner-controlled infrastructure) and any spend, which needs his explicit approval before any purchase.
**VIDEO HOSTING (owner question, Nov 20, 2026 ~15:47 PST):** the downloaded local files are NOT hosted for public streaming in V5 — the public site plays via YouTube (item 13), so it works fully without hosting the videos. Hosting the ~1 TB library for the public to stream is a separate decision: storage is cheap, streaming bandwidth is the real cost and scales with viewers, and the 1 TB upload from the laptop takes significant time. Price it before any spend; nothing purchased without owner approval.
**HOSTING CHOICE (owner, Nov 20, 2026 ~15:54 PST; APPROVED Nov 20, 2026 ~15:58 PST): Cloudflare R2.** Cheapest for the fallback use: $16.94/mo storage at 1.139 TB and free egress, so playback costs nothing no matter how much is watched. Setup approved; still needs: Cloudflare account (email + card on file via secure entry) + 1.14 TB upload from the laptop, which is the long step. Nothing created or bought yet.
**VIDEO-HOSTING PRICES (verified from the providers' own pricing pages Nov 20, 2026; library 1.139 TB conservative = 1,139 GB):** storage per month at the real size — Backblaze B2 $7.92, Cloudflare R2 $16.94 (after 10 GB free tier), Bunny Storage $11.39 (single region). Streaming per TB watched — R2 free in every region; B2 free up to ~3.4 TB/mo (3x stored) then $10.24/TB; Bunny Standard $10.24/TB US/Europe, $61.44/TB Middle East & Africa ($5.12/TB flat on Volume network). CloudFront per-GB rates NOT verified from AWS's own page in this check (its pay-as-you-go page showed the 1 TB/mo free tier but the rate table did not come through) — do not quote $85/$110 as verified. Wasabi/S3 storage not verified from source either. KEY POINT: the hosted copy is the fallback only — it serves viewers only when YouTube fails — so the realistic bill is mostly storage, about $8–17/month, with streaming near zero while YouTube works. CORRECTION: the earlier $7–15 figure was priced at exactly 1 TB; at the real 1.139 TB it is $8–17.
**PLAYBACK PRICE (per hour watched):** from the assessment model (1,055 hours = 0.948–1.139 TB), one hour of watching uses ~0.9–1.1 GB. So one hour on the hosted backup costs ~$0.01 on Bunny in America/Europe, ~$0.06 in the Middle East, ~$0.005 on Bunny Volume, $0 on R2, and $0 on B2 while inside its free allowance. YouTube playback and local playback in the installed app are free — there is no playback charge on the normal paths at all.
**Acceptance:** hosted rendering recorded as verified only after the smoke test actually runs; until then it stays recorded as unverified.

### 13. Auto-sync new uploads + in-page YouTube playback with local fallback. (Owner order, Nov 20, 2026 ~15:40 PST — overrides the verdict's "no embeds" rejection and amends item 3)

**What:** three linked behaviors.
- **(a) Auto-sync:** every time a new video is uploaded to the Sheikh's YouTube channel, it is (i) downloaded into the local archive and (ii) added to the website catalog as a video with BOTH playback options (YouTube + local), same as every existing video. A new upload must never sit on YouTube without also being in the library.
- **(b) In-page YouTube playback:** clicking a video in a playlist opens the player INSIDE the same page, same tab, same site. It plays directly from YouTube there. No new tab for the primary YouTube mode.
- **(c) Local fallback:** if YouTube playback fails (offline, removed, blocked, player error), the local file is the backup — the player switches to, or offers, the local file.
- **(d) Hosted playback option (owner order, Nov 20, 2026 ~15:54 PST):** the player also offers the hosted copy (Cloudflare R2) as a second option on the same screen. YouTube is the automatic default on click; the hosted version never starts by itself — the user chooses it. If YouTube fails, the player offers the hosted copy first, then the local file. Order: YouTube first and automatic, hosted by choice or on YouTube failure, local file as the last fallback.
**Where:** the lesson detail page player area (item 3's surface). The catalog entry for a new upload appears as soon as its YouTube ID is known, even before the local download finishes; the local option becomes available once the file lands.
**Mechanics:**
- YouTube mode: embedded player in the page (YouTube iframe player; prefer the privacy-enhanced `youtube-nocookie.com` host where the player API allows it). No autoplay without user action. Activating YouTube mode pauses local playback, saves local position, stops recitation (same as item 3).
- Failure detection: on player error / no-network / unavailable video, show the local fallback action and switch to local playback when the file exists. If neither YouTube nor the local file is available, show the explicit unavailable state (item 3's state machine).
- Auto-download route: the existing auto-archiver (`06-auto-archiver.ps1`, laptop-side) is the download mechanism; its scheduled-task activation (`06b`) is the remaining laptop step and must be run on the owner's machine. The catalog refresh that adds the new video to the website is a build-time/periodic step: new IDs enter the catalog with YouTube availability first, local availability after the download verifies.
- **Consequence, recorded honestly:** in-page YouTube playback means the page makes external requests to YouTube while that mode is used. The "zero external requests" guarantee (item 9) now applies to LOCAL mode only; YouTube mode is an explicit, user-initiated exception, same as the old link-out, but heavier (player assets, not just a navigation). The item-9 guard must be re-scoped: the YouTube player iframe is allowed ONLY inside YouTube-playback mode and blocked everywhere else; local mode must still show zero external requests.
**Acceptance:** a new upload appears on the site with both options; clicking a video plays YouTube inside the same page automatically; the hosted option is visible on the player and switches playback to the R2 copy; killing the network (or a forced player error) falls back to the hosted copy, then the local file; local mode still passes the zero-external-request check.

### 14. Transcripts in Arabic and English — full readable file in the same browser. (Owner order, Nov 20, 2026 ~15:41 PST — confirms V4 behavior, extends it to new uploads)

**What:** every video keeps its full readable transcript in Arabic AND English, exactly as in V4. The user clicks it in the same browser and the whole text shows on the same page — no download, no new tab, no leaving the site.
**Where:** the lesson detail page transcript panel (V4 behavior: `transcripts-index-v7.js` + `transcripts-readable-v7/*.ar.txt` / `*.en.txt`; tap-a-line sync with local playback). Language toggle AR/EN; full text scrollable and readable in-page.
**Rules:**
- Both languages wherever a transcript exists; nothing is dropped from V4.
- New uploads (item 13) get AR + EN readable transcripts too, through the existing transcript pipeline, appearing with the video.
- YouTube mode (item 13): the transcript panel stays available while playing via YouTube in-page. Line-by-line sync with the YouTube player is a build item to verify; fallback is the full text readable with manual scroll.
**Acceptance:** click the transcript on a sample video in both languages and the whole file shows in-browser; a new upload's transcripts appear with the video; transcript panel present in both local and YouTube playback modes.

### 15. Login page + per-account progress. (Owner order, Nov 20, 2026 ~20:09 PST)

**What:** the opening page gets a beautifully designed login page, in the same Illuminated Page design language as the opening, not a generic form. The visitor signs in with their own Gmail (Google sign-in). Once signed in, the library knows that account: it shows the account's own progress — which videos were watched and how far (for example half-watched), which classes and courses have been started, and overall progress per course and per series. Progress follows the account, not the device.
**Where:** the opening page, as the way in: instead of a single "enter library / ادخل المكتبة" button, the opening offers two options — sign in with Gmail, or enter as a guest. The verse opening treatment stays; the Illuminated Page opening choreography must not regress. After sign-in, the user enters the library with their progress visible.
**Rules:**
- Sign-in is with Google (Gmail) only in v5; the app stores no passwords.
- Per-account progress covers: per-video watch position and watched state, per-series and per-course started and completion state, and the Continue rail filtered to that account.
- A signed-out visitor can still enter the library; their progress stays local to the device exactly as v4 does today (localStorage keys unchanged). Signing in must never wipe or overwrite local progress; on first sign-in, local progress is offered for merge into the account, never silently discarded.
- Design: the login page matches the v5 visual standard (same fonts, gold-line restraint, geometric pattern, no placeholder language, no em dash). Both languages, 390px, keyboard accessible, reduced-motion respected.
- Setup needs: Google sign-in configuration and a store for per-account progress. The build proposes the exact shape (hosted-site backend vs. the installed app's local account store); no Google Cloud project, account, or paid service is created without the owner's explicit word. The zero-external-request guarantee (item 9) applies to local and offline mode; the sign-in itself is an explicit user-initiated action and its network scope is documented.
**Acceptance:** the opening page shows the designed login; signing in with a Gmail account loads that account's progress (a half-watched video resumes where it stopped, started classes show as started); signing out returns to the opening page; guest entry still works with local-only progress; no account's progress is visible to another account; nothing is created or charged without the owner's word.

**AMENDED — SUPABASE DECISION (owner order Nov 20, 2026 ~21:33 PST):** sign-in uses Supabase Auth email + password, the same approach as SLATE (verified firsthand Nov 20: SLATE production uses a hosted Supabase Cloud project; sign-up goes straight to the dashboard with no confirmation email). The archive gets its OWN separate Supabase project under the SAME Supabase account as SLATE. Separate projects have separate auth users, databases, URLs and keys, so there is no conflict with SLATE as long as nothing is added to SLATE's project. This supersedes the Google sign-in lines above (the "What" and the "Sign-in is with Google only" rule) and settles the design council's B1 (sync store) hard stop. The email option is wired to the archive's own project config; guest entry stays fully offline with local progress. No Supabase project is created without the owner's explicit word at the moment of creation.

## DEDUPLICATION RULE — REQUIRED build step (owner instruction, Nov 20)

The owner is about to share material the Sheikh himself sent him (books / biography material). **Every incoming item must be checked against what is ALREADY in the library before it is listed anywhere. No duplicate books, no duplicate bio facts, no duplicate series. Any duplicate is flagged to the owner instead of being listed twice.** This is a required build step, not a nice-to-have, and it governs the Books metadata (item 4) and About copy (item 5) items above.

**(a) Books — title and file matching.** Compare each incoming book against every book already in the library (and against other incoming books) on:
- Arabic title, normalized: strip diacritics (tashkeel), normalize alef variants (أ إ آ to ا), hamza variants, teh marbuta / heh, yeh / alef maksura, and punctuation; case-fold the English title; collapse whitespace.
- English title, same normalization (case, punctuation, whitespace).
- File name: exact file-name match, and normalized file-name match (same normalization, ignoring extension and separators such as `_`, `-`, spaces).
- Matching rules: **exact match** (identical after normalization) = duplicate; **normalized match** (titles match after normalization even if the raw strings differ) = duplicate; **same file name** = duplicate even if the title differs. Any of the three fires the duplicate flag.

**(b) Bio facts — About page and archive.** Compare each incoming bio fact (teacher name, degree, date/period, position/role, institution, ijaza grantor/subject) against what is already on the About page and what is derivable from the archive:
- Teachers and ijazat: normalized name match (same Arabic normalization as above) plus subject/text match where given.
- Degrees/institutions/dates/positions: normalized institution + degree + year match; a fact already stated on the page (even in different wording) is a duplicate.
- Matching rules: **exact match** on the normalized fact = duplicate; **normalized match** (same person/institution/date under a spelling or wording variant) = duplicate; a fact already implied by an archive-derived stat on the page = duplicate. Near-matches that cannot be resolved (e.g. same name, different dates) go to the owner review list as "possible duplicate — needs owner ruling", never onto the public page.

**(c) Series / playlists — video ID and title.** Compare each incoming series against the existing 71 playlists and 3,977 catalog entries:
- **Same video ID:** any incoming video whose YouTube video ID already exists in the catalog is a duplicate entry, even under a different title.
- **Normalized title match:** playlist/series titles normalized as in (a); a normalized title match against an existing playlist = duplicate series.
- Matching rules: **exact match** (same video ID, or identical normalized title) = duplicate; **normalized match** (title matches after diacritic/alef/hamza/punctuation normalization) = duplicate. A series whose videos are all already in the catalog under another playlist is flagged as a duplicate series even if its title differs.

**Where duplicates go.** Duplicates NEVER go on the public page, the Books list, the About page, or any series rail. They go to an **owner review list** (internal, build-time): each entry records the incoming item, the existing item it matches, the matching rule that fired (exact / normalized / same video ID / same file name), and the disposition (owner confirms it is the same item, owner confirms it is distinct, or owner merges them). Nothing on that list ships until the owner rules on it. The build must fail or warn (not silently list) when an unreviewed duplicate is present in supplied material.

## Must not regress (audit-verified excellent in v4)

The Illuminated Page opening choreography; tap-a-line transcript sync; zero placeholder/draft language anywhere; fixed RTL chrome; theme picker + Calm motion toggle; About stat row (with units, per item 5); one primary action per card; in-page transcripts; the font stack; recitation silent-by-default with play/pause/replay/mute/volume and no overlap with video audio; mark-as-watched persistence; per-video resume position and the Continue rail (existing v4 behavior, verified not rebuilt); the 40-day path; saved state and favorites keys.

## Hard rules (unchanged, plus the verdict's additions)

- Fully offline: ZERO external requests at runtime. Verify by test (item 9). The YouTube option is an explicit user-initiated link out, never an in-app embed or fetch.
- No em dash character in any UI copy. Grep to verify.
- The verse text is never animated except its one allowed fade+rise on the opening.
- Catalog DATA reused only as reconciled by item 1; never renumber, rename, or reorganize media.
- Recitation: the CC0 file already bundled is the licensed path — never swap in another recording, never AI audio.
- Never include media files in any output. Book binaries never go in the preview flavor.
- Only Sheikh Moustafa Kamel is prominent. No other-scholars section, no curated other-speaker rail.
- No invented biography, book titles, contents, authors, or file names. Unknowns stay marked unknown and omitted.
- No AI credit lines anywhere. No purchases, no paid keys, no third-party clouds.
- The dedup rule above is a required build step.

## Verification (all required, recorded honestly)

- `build.py` assembles + verifies (reconciled counts with units, no external URLs except the validated YouTube anchors, no em dash, zero placeholder strings, recitation.mp3 present and valid audio, build-time video-ID match, dedup check with owner review list).
- Live HTTP tests incl. `/__status`, catalog.js, offline test, and the item-9 network guard proof.
- The item-2 owner-hardware verification matrix as a release gate, recorded in `v5/TEST-RESULTS.md`.
- Headless-Chromium screenshots of every major screen (both languages, 6 themes, mobile 390px), eyeballed by the builder; all 65 v4 screenshots reviewed by eye plus every new v5 screen.
- Behavior tests: dual playback state machine (all three states), recitation stop on YouTube link click, Books gating (hidden until ready), native PDF reader + Open-file fallback on mobile Safari/Chrome, About omission rules, dedup flagging.
- Honest `TEST-RESULTS.md` and `DECISIONS.md` (what ran, what could not be verified: anything the owner-hardware matrix did not cover).

## Deliverable

`~/workspace/archive-rebuild/archive-rebuild-v5.zip` — app source ONLY, zero media: `Preview/archive.html` (v5 single-file), `Preview/archive_server.py`, `Preview/assets/` (fonts, SVG, **recitation.mp3**), `Preview/catalog.js`, `Preview/docs/server-contract.md`, both launchers byte-identical unless an item above requires a change (listed explicitly, `.bak` backup first). Laptop-installable exactly like v4. Book files are NOT in the ZIP until the owner supplies approved files; the ZIP carries the Books infrastructure and metadata only.

## Deferred (explicitly NOT in V5)

- Card/row/search/Saved YouTube links (deferred to a later version, after real playback verification; detail page only in V5).
- Bundled PDF.js; EPUB support; virtualized lists; 6th nav item; "under construction" / "غير متوفر" copy; "total years" / "years of publishing" unverified stats; unverified "Dr." honorific.
- Arabic grammar sub-track; See-also cross-links for near-duplicate series; recently-added rail; search synonyms; YouTube health-check as an app feature (owner-run tool only, never a paid key); local progress backup/restore.
- Books visible before an approved book exists; books on Where to Start; books in Saved.
- Any playbook §8 DO NOT item.

## Operating rules

- Full autonomous authority inside `~/workspace/archive-rebuild/v5/`. Never stop to ask questions, except for the OWNER INPUT NEEDED items above, which are the owner's by definition.
- **COUNCIL DECIDES ALL DESIGN A TO Z (owner order Nov 20, 2026 ~20:11 PST):** the team council decides every design decision in the whole V5 project, not just the login page — every screen, every flow, every string, every motion choice, from A to Z. The builder follows the council's design verdict; it does not decide design alone. The verdict is recorded in `v5/verdict-design-20261120.md` before design-sensitive items are built.
- **NOTHING SHIPS WITH A FLAW (owner order Nov 20, 2026 ~20:11 PST, reinforcing the zero-error bar):** everything is checked thoroughly before the owner sees a final result. No holes, no flaws, no half-checked screens. The item-2 gate and independent testing are the mechanism; a check that was not actually run is recorded as not run, never as passed.
- Checkpoint lines with ISO timestamps to `~/workspace/archive-rebuild/checkpoints.log` at each milestone.
- Work fast: reuse DATA as reconciled, parallelize tracks, timebox screenshot-fix loops, early visual checkpoint.
- When the build passes the screenshot review and the item-2 gate, create the ZIP and report: what was built, test results, anything unverified. Do NOT deliver anything to the owner directly.
