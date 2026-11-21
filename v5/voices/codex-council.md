# Codex council: round 2

Planning only. Read all six round-1 files, playbook sections 3.33 and 8, v4/TEST-RESULTS.md, v4/DECISIONS.md, and the preview source. GLM is absent because credentials were unavailable, never an agreement. Scores below are my scores, not votes attributed to other voices. Scale: 5 strongest, 1 reject. No browser opened, tests rerun, purchases, connector calls, or app edits.

## 1. V4 audit verdict, claim by claim

Paths below are relative to /home/hatch/workspace unless stated otherwise.

| Claim | Firsthand check and verdict |
|---|---|
| 3,977 videos, 71 playlists | Parsed DATA from archive-rebuild/v4-preview/sheikh-library-v4-preview.html using Python JSONDecoder. Exactly 3,977 records and 3,977 distinct video IDs; 71 playlists. Holds for app catalog, not proof of media presence. |
| 4,320 memberships | Summed playlist items: 4,320. Parsed v4/build/Preview/archive.html and catalog.js: both DATA objects equal the preview. All membership IDs resolve to video records. Holds. |
| Inventory completeness | Read all 71 pl_entries_*.tsv files under youtube-archive/metadata/inventory, counted nonempty rows and compared per-playlist ID multisets. 4,332 rows; playlist ID sets equal. 13 TSV-only occurrences, one app-only occurrence. Fails reconciliation. Net difference 12 is insufficient evidence of what is missing. Neither source is automatically authoritative. |
| Bukhari | PLXKSrZvHoN9cf7lGMyZjw0cndaCk004f0: app 1,128 memberships / 996 distinct IDs; TSV 1,131 rows / 999 distinct IDs. TSV-only IDs: uK0gvIbzbbI, hYRb7csrJdQ, eJ6ZMd4sVrI, one occurrence each. No app-only occurrence in this playlist. Gemini's 135 missing lessons, also repeated in its transcription note, compares incompatible units and is false as a membership audit. |
| YouTube identity | All 3,977 IDs match the final bracketed ID in their URL-decoded media basename before mkv/mp4/webm. This supports deterministic link construction. It proves neither local file existence nor current YouTube availability. |
| 26/26 HTTP, 37/37 behavior, 65/65 screenshots | Read existing testroot/http-tests.out, behavior-tests.out, shots.out: 26 PASS lines, 37 PASS lines, 65 ok lines; recorded failure totals zero. Found 65 PNGs in v4/shots. Corroborated historical logs, not rerun results or a fresh visual review. Fixtures were generated media on Linux Chromium. |
| Zero external requests | Historical behavior and screenshot evidence supports tested flows. Static preview inspection found one literal HTTPS URL in a catalog donation-video title, not a fetched resource. Therefore zero literal URLs across the whole artifact is false; zero runtime external requests is a different claim. build.py checks extracted UI text, not all catalog text. No fresh runtime capture performed. |
| Zero errors in screenshots | Qualified: shots.out reports desktop-ar-error-404 with errors=4 for expected missing-media/console 404 events, despite overall pass. TEST-RESULTS prose about each shot checking console errors must not become a claim that every console was empty. |
| Zero em dash / placeholder language | Counted zero em dash characters in the entire preview. Placeholder-token matches inspected were CSS/input placeholder syntax, not unfinished biography. build.py has explicit UI-text guards. Zero unfinished copy remains a recorded guarded claim plus source inspection, not a new native-language certification. |
| Bundled CC0 recitation, 20.8 seconds | Built MP3 and research_notes/islamic-archive-v4-improvements-20261029-0426/recitation.mp3 are both 250,529 bytes, SHA-256 becac1d59cad2e81406d6c788556e3878de3ae68ad839a4d184917a539576c63. File identity holds. CC0 provenance and browser duration 20.8 seconds are recorded, not independently relicensed, decoded, or listened to here. |
| Recitation guard | Source stops recitation on lesson play and pauses video before recitation play. Historical fixtures test media state. Audible non-overlap on real videos remains unverified. |
| Continue and position resume | Both already exist. v4/src/app.js saveProgress stores integer currentTime after five seconds, timeupdate saves about every four seconds, pause and pagehide save, resume=1 restores on loadedmetadata. Preview also contains Continue rail and resume controls. Source-established behavior, not a fresh playback test. |
| List performance | Preview mountList uses idle chunks, IntersectionObserver and limit=1500, then Show more increases limit by 1500. Existing implementation, not evidence of measured laptop latency. |

Verdict: V4's catalog dimensions and historical fixture test totals hold. Inventory parity and blanket real-world playback/readiness do not. Source support does not close the TEST-RESULTS exclusions.

Before V5 ships on the owner's laptop: launch from the real archive and drive paths; play, seek, pause and resume representative actual MKVs and any available MP4/WebM samples; test missing drive, disconnect, confirmed 404 and unsupported/corrupt media separately. Listen through real speakers while switching recitation to video and video to recitation, including rapid lesson changes and the new YouTube action. Exercise startup skip, autoplay refusal, Saved and persisted progress. Capture network traffic with networking available and disabled, requiring zero external app requests; only a deliberate YouTube navigation leaves the app. Verify the approved book file offline if Books ships. Record OS, browser versions, sample IDs and outcomes.

Windows and macOS launchers require their actual operating systems, even if the owner's laptop covers only one. Safari and Firefox need real runs, including native PDF fallback if supported. Native Arabic review remains owed. Real-host rendering remains unverified until run on the approved host; it gates any hosted claim, not an otherwise verified installed-only release. Do not label unsupported combinations as passed.

## 2. Direct debate and option scores

### Books navigation

Gemini, Qwen and Kimi: a sixth destination scores 1/5 against an explicit five-item rule already tested at 390px. Replacing an existing destination without a concrete navigation map scores 2/5. Keeping five with Books inside Library and a Sheikh-page cross-link scores 5/5. Qwen's المكتبة collides with Library; use الكتب for a Books entry, subject to native review.

DeepSeek: hiding the public Books entry until one approved readable file exists scores 5/5. I adopt that gate, but not a hidden sixth nav item that becomes a rule violation later. Showing an empty promotional Books section scores 1/5. This combines discoverability after content exists with stable navigation.

### Reader

Gemini and Qwen: bundled PDF.js scores 2/5 now. Its best argument is consistent controls across browsers, particularly when embedded native viewers fail. That is a real capability argument, but there is no supplied book demonstrating a blocker and it violates the dependency-free baseline without an explicit exception.

Kimi: native browser reader with a local Open file fallback scores 5/5 for the initial PDF path. A native iframe alone scores 3/5 because support and focus behavior differ. Test actual supplied files before promising search, selection or accessibility. DeepSeek's local worker/reader scores 2/5: local hosting solves external requests, not dependency, licensing, size or maintenance. A worker is not itself a PDF renderer. Defer unsupported formats, 4/5; silently convert or assume invented filenames, 1/5.

### Dual playback placement

DeepSeek's detail-page pair on every lesson route scores 5/5. My round-1 phrase every lesson route meant direct links and lessons reached through search, Saved or playlists, not two actions on every card. Gemini/Kimi's links on every card, row, search result and Saved item score 3/5: faster escape when the drive is missing is their strongest case, but thousands of extra tab stops and nested-target risks need evidence. Qwen's optional row icon scores 3/5. Guarantee both actions on lesson pages first; never probe files per card.

Use the existing case-sensitive catalog ID, validated against decoded filename at build time. Runtime re-extraction scores 2/5; validated catalog ID scores 5/5. Link out explicitly with internet/new-tab disclosure and noopener noreferrer. Pause local video, save position and stop the existing recitation on activation. No embed, fetch, thumbnail, API, preconnect or speculative navigation.

### Missing file

I hold with DeepSeek and Kimi's 404 recovery: unavailable-local status plus YouTube as primary scores 5/5. Gemini's dimmed but clickable local primary that produces another failure scores 1/5. Retry as a secondary action scores 4/5 when a drive may reconnect. An ambiguous probe failure is not a confirmed missing file; preserve local retry or Open file where meaningful. Never open YouTube automatically or disable its link using navigator.onLine.

### Release scope and existing work

DeepSeek's catalog-first hardening scores 5/5; feature-first expansion scores 2/5. However, indefinite hardening that never delivers the requested link-out and owner-ready Books/About scores 2/5. Freeze the data snapshot, resolve exceptions, then implement the bounded requirements. This is the argument against our quick consensus: hardening needs an exit condition, not unlimited veto power over delivery.

Qwen and DeepSeek virtualization scores 2/5 now; preserve and measure existing chunks plus soft cap scores 5/5; dependency-free virtualization after demonstrated failure scores 3/5. Qwen's 55 FPS target with 500+ visible items does not establish the owner's laptop experience. Kimi's soft-cap proposal is already implemented, so score regression verification, not a new feature.

DeepSeek's Continue rail as new work scores 1/5. Even per-video position resume is already implemented, contrary to its coordinator note and the consultation prompt's characterization. Preserve and test it, 5/5. Gemini's chunking and local-audio guard are also existing V4 behavior; regression checks score 5/5, rebuilding them scores 1/5. The YouTube activation stop case is new, 5/5.

### Books preview and curation

Kimi's metadata-only preview scores 5/5; embedding book binaries scores 1/5. Only approved metadata may appear. Its installed-app availability note must reflect a supplied, working installed book, not a promise. No invented sample titles, contents or paths. Authorship is verified per book, never Qwen's default assumption. Rights must explicitly cover each distributed edition and any separately proposed hosted copy.

Kimi's owner-verified grammar sub-track scores 3/5; automatic extraction from a memorization-program title scores 1/5. The owner must identify lesson IDs, scope, order and accurate label. Do not infer grammar coverage from curriculum expectations. Likewise Qwen's forced mapping of all ambiguous playlists scores 1/5; seven explicit owner curation decisions with ordinary archive access retained scores 5/5. Membership mismatch alone does not prove broken media paths or lost search access.

### About the Sheikh

A finished minimal page with approved name, monogram and archive teaching index scores 5/5. Precisely sourced, approved biography and teachers/ijazat score 5/5 when evidence exists. Qwen's under-construction statement scores 1/5 and violates the placeholder rule. DeepSeek's public unknown/unavailable biography fields score 1/5; omit absent sections and keep unknowns in the editorial record, 5/5.

Gemini's scholar/lecturer role, Qwen's methodology and Kimi's retained Dr. title cannot become verified merely by appearing in V4. Require publishable evidence and owner-approved wording. A catalog series index describes this archive, not his complete legacy. Dates in metadata do not establish a life timeline. Teachers require exact person, subject and relationship; ijazat require the precise authorization and grantor, with relevant supplied details and permission. Ordinary references to teachers do not justify an other-scholars section. Generic prestige language scores 1/5.

## 3. Revised ranked V5 list

| Rank | Work | Score | Completion evidence |
|---|---|---|---|
| 1 | Reconcile catalog and freeze approved source | 5/5 | Ordered occurrence audit, explicit exceptions, count units and durations; preserve IDs, paths and saved keys. |
| 2 | Close real-device and offline gaps | 5/5 | Matrix above, honest failures/unsupported cases, exact recitation hash retained. |
| 3 | Dual actions on every lesson route | 5/5 | Exhaustive canonical href checks, missing/format/probe states, no external requests, audio stopped on link activation. |
| 4 | Native Arabic and accessibility | 5/5 | Approved bilingual strings, keyboard/screen-reader flows, focus, six themes, 390px, zoom and reduced motion. No paid reviewer purchase. |
| 5 | Seven owner curation decisions | 4/5 | Decisions keyed by playlist ID; pending material kept outside curated paths without hiding ordinary access. |
| 6 | Books with actual approved files | 4/5 | Five-item nav retained, metadata-only preview, native reader plus fallback tested offline, permissions recorded. Content availability gates shipment of this surface. |
| 7 | About claim audit | 4/5 | Every public claim sourced and approved; unsupported sections omitted; no invented role or credential. |
| 8 | Performance and progress regression | 4/5 | Measure laptop queries and large views; preserve chunks, Show more, Continue and position resume. Optimize only demonstrated failures. |
| 9 | Real-host parity if offered | 3/5 | Actual rendering, encoding, MIME/ranges, versions, permissions and book behavior checked on approved infrastructure. |
| 10 | Grammar sub-track and See also | 3/5 | Owner-approved exact lesson selections and relationships, after core gates. |
| 11 | Recent searches, synonyms, recent rail | 2/5 | Defer pending demonstrated need and content accuracy; dates alone do not prove recently added to this installation. |

## 4. Concessions and corrections to round 1

- Adopt DeepSeek's explicit content gate: no public Books entry before an approved readable book exists. Keep my five-nav structure.
- Adopt Kimi's explicit metadata-only preview rule. The installed reader and preview have different payloads and claims.
- Tighten my resume wording: V4 already persists and restores per-video position, not just a Continue rail. The proposed delta is link-out integration and real-media verification.
- Raise accessibility/native Arabic from 4 to 5 for affected core flows. Additional actions and reader transitions make this a release gate.
- Keep my native-reader-first, lesson-route actions and missing-file recovery positions despite the contrary card/nav/PDF.js proposals. Their benefits do not yet outweigh demonstrated constraints.

## 5. Open disagreements for Claude Code

1. Confirm five primary destinations remain binding. Any sixth needs an explicit rule change and a proven 390px design, not a majority vote.
2. Decide whether ubiquitous card links are an actual requirement or an optional follow-up after lesson-page usability evidence.
3. Decide whether actual supplied PDFs expose a native-reader blocker that warrants a dependency exception. No reader library commitment before that evidence.
4. Obtain owner decisions on inventory exceptions, the seven playlists, book editions/rights, grammar selections and publishable biography. Council preference cannot supply these facts.
5. Set the supported OS/browser/format matrix and whether hosted delivery is in scope. Unrun combinations remain unverified.

Playbook 3.33 discipline applied through explicit alternative scores and the hardening counterargument. Hard-constraint failures cap the verdict regardless of votes. Playbook 8 remains closed: no re-vetting, buying, installing or joining its exclusions. Only Sheikh Moustafa Kamel stays prominent. Keep the exact bundled CC0 recitation, no other recording or AI audio, no AI credit lines, no paid keys or third-party clouds. Unknown content stays unknown in planning and absent from public biography until verified.
