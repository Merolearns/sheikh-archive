# DeepSeek voice: V5 consultation (Sheikh Moustafa Kamel offline video library)

- Voice: DeepSeek (independent reviewer), consulted via the `custom.deepseek` connector (`deepseek-chat`, model `deepseek-flash`), 2026-11-20.
- Balance before call: $40.38 (verified with `--check-balance`). Call cost: 1,275 prompt tokens + 15,251 completion tokens (10,353 reasoning), finish_reason `stop`, no retry needed.
- Material sent: public product facts only (v4 scope, known catalog discrepancies, decided V5 requirements, hard constraints). No proprietary code, credentials, or private data was sent.
- Grounding read first: `~/workspace/vetted-playbook.md` (including §8 DO NOT list), `~/workspace/archive-rebuild/BRIEF_V4.md`, `v4/DECISIONS.md`, `v4/TEST-RESULTS.md`, the five research reports, and the v4 preview file (checked: no YouTube links in v4, `CATALOG_VERSION 3c30b87ae0c1`).
- The answer below is DeepSeek's answer verbatim, except for this header and the coordinator note at the end. No em dash appears in DeepSeek's text.

---

Verdict: V5 should be a hardening release, not a feature expansion. The three new requirements are sound if dual playback is treated as a strict local-first action pair, Books waits for verified owner files and metadata, and About stays empty or marked unknown until sourced. The highest risk is catalog truth: the DATA-vs-TSV gap and the 7 unreviewed playlists must be resolved before adding more surfaces. Build V5 around reconciliation, testable offline behavior, accessibility, and performance, then ship Books and About only with owner supplied facts.

(1) Design for requirement 1 (dual playback)

Placement:
- On every video detail page, add a playback action bar directly under the video title and above the description or transcript. This is the canonical place for both actions.
- On desktop, show two side-by-side buttons. In RTL, place the local playback button first in reading order. On mobile, stack them full width.
- In the player idle state, show the local play button large and centered. Show the YouTube action below it as a secondary text link with a helper line.
- Do not put YouTube links on every video card or every playlist lesson row. Those rows open the detail page. This keeps a 4,000-video catalog clean. The detail page is the guaranteed dual playback surface for every video.
- If local playback fails during use, show an inline error panel inside the player area with the YouTube action repeated there.

Labels in Arabic and English:
- Local playback, normal state: Arabic "تشغيل داخل المكتبة" English "Play in library"
- YouTube action, normal state: Arabic "مشاهدة على يوتيوب" English "Watch on YouTube"
- YouTube helper text: Arabic "يفتح يوتيوب في المتصفح ويتطلب اتصالاً بالإنترنت" English "Opens YouTube in your browser. Requires internet."
- Local path absent: Arabic "الملف المحلي غير متوفر" English "Local file not available"
- Local file present but playback error: Arabic "تعذر تشغيل الملف المحلي" English "Local file could not play"
- Video ID absent: Arabic "رابط يوتيوب غير متوفر" English "YouTube link not available"
- Player error panel title: Arabic "تعذر التشغيل" English "Playback unavailable"

Behavior when local file is present:
- Local playback is primary and default. It uses the existing local media path and never makes a network request.
- YouTube is secondary but always visible and always available when a valid video ID exists.
- The YouTube action is a normal link to https://www.youtube.com/watch?v=<VIDEO_ID>, opened with target blank and rel noopener noreferrer. No iframe. No embed. No thumbnail fetch. No preconnect. No API check.

Behavior when local file is missing or cannot play:
- If the catalog media path is empty, disable the local button and show "الملف المحلي غير متوفر" English "Local file not available". Promote the YouTube action visually to primary.
- If the path exists but the browser fires a media error, show "تعذر تشغيل الملف المحلي" English "Local file could not play". Keep local retry possible, and show the YouTube action inside the error panel. This avoids falsely calling a codec failure a missing file.
- The app never tries to repair, transcode, or fetch a replacement file automatically.

Edge cases:
- No internet: the app must not ping YouTube or make any external request. The YouTube link stays a plain link. The helper text says it requires internet. If the browser is offline after click, the browser shows its own error. The app does not disable the link based on guessed connectivity.
- Video removed from YouTube: the app cannot know this offline. The link opens YouTube and YouTube shows its own unavailable page. Local playback remains unaffected. The owner can update the ID later through the catalog.
- Video ID absent from catalog entry: do not render an active YouTube link. Show the disabled label "رابط يوتيوب غير متوفر" English "YouTube link not available" and add the video to an admin QA list.
- Invalid video ID format: treat it as absent. Accept only the normal YouTube ID pattern if a validation step is added. Do not guess IDs.
- YouTube link opening: always user initiated. The app must pass a network guard test proving that YouTube is contacted only after a click, never at load, never during search, and never while rendering cards.

(2) Design for requirement 2 (Books section)

Section design:
- Add a main navigation item labeled Arabic "الكتب" English "Books". Hide it entirely until at least one approved book record and file are supplied. If someone opens the direct route with no books, show Arabic "لا توجد كتب متاحة حالياً" English "No books are available yet."
- The books list uses a clean RTL list or grid. Each item shows the Arabic title, the English title only if supplied, the author attribution exactly as supplied, and a cover image only if the owner supplies one with permission. If no cover is supplied, use a text-only placeholder with the title. Do not generate fake covers.
- Sort order is owner supplied. Do not invent categories. If the owner supplies categories, use only those categories.
- Book detail page shows only owner supplied metadata: title, author line, description, publication details if verified, file format, and a primary action Arabic "قراءة" English "Read".
- If the file is missing, disable the read action and show Arabic "الملف غير متوفر" English "File not available".

Reading experience:
- Open a dedicated full-screen reader route or overlay. It must work fully offline from local files served by the local Python server.
- Use a locally bundled reader. No external viewer, no CDN, no external fonts, no external worker, no analytics. If a PDF renderer is used, its worker and assets must be local.
- Controls: previous page, next page, page number field, zoom in, zoom out, fit width, fullscreen, and close. Keyboard operation for all controls. Remember the last page per book in local storage and offer resume.
- Show page count when known. Do not promise in-book text search unless the file has a text layer and the owner approves indexing. If search is added later, it must run locally.
- Do not autoplay the recitation in the reader. Books are reading only.
- Accessibility: label all reader controls in Arabic and English, keep focus visible, support zoom, and test with keyboard. PDF accessibility depends on the supplied file, so do not claim full screen-reader support for a scanned PDF.

Exact owner inputs needed, checklist:
- [ ] One approved file per book in its original format, with DRM free status confirmed. State the format. PDF is the preferred first format if that is what the owner has.
- [ ] The exact Arabic title as it should display.
- [ ] The exact English title, or confirmation to omit English title.
- [ ] The exact author attribution line, including any coauthors, or confirmation that only Sheikh Moustafa Kamel should be credited.
- [ ] A short Arabic description written or approved by the owner, or confirmation to omit descriptions.
- [ ] An English description if available, or confirmation to omit.
- [ ] Verified publication details only: publisher, year, edition, volume count, ISBN. Mark unknown if not supplied.
- [ ] A cover image file and permission to use it, or confirmation to use a text-only placeholder.
- [ ] Permission to bundle the file and allow offline reading inside this app. Confirm whether copying or printing should be discouraged, while noting browser limits.
- [ ] Table of contents or page labels if available. Otherwise the reader uses PDF page order.
- [ ] Owner defined display order and any owner defined grouping. No invented categories.
- [ ] Confirmation of language and direction per book, especially for Arabic, English, or bilingual books.
- [ ] Confirmation whether each item is a complete book or an excerpt.
- [ ] Confirmation whether book text may be indexed for local search. If yes, provide extracted text or permission to extract it locally.
- [ ] Final owner approval of the exact displayed title, author, description, and metadata.
- [ ] A contact decision maker for corrections and rights.

(3) Design for requirement 3 (About the Sheikh)

Verified facts only:
- Show the official name exactly as supplied by the owner or the Sheikh's team.
- Show the role line exactly as approved. Do not expand it.
- Keep the calligraphic monogram only if it is already approved.
- Show archive-derived stats with a clear label Arabic "من الأرشيف" English "From the archive". These are archive facts, not biography.
- Show biography paragraphs only when the owner supplies exact approved Arabic text and, if published, an approved English translation. Each fact should have an internal source note and approval status.
- Show education only when exact institutions, degrees, years, and locations are verified. Use the owner's exact wording.
- Show teachers and ijazat only when exact names, subjects, dates, and chain details are verified and approved. The standing rule is strict: be specific on teachers and ijazat or stay silent. Do not use vague lines like "studied under scholars."
- Show background milestones only when verified and approved.

What must stay unknown or blank:
- Birth date, birthplace, family details, travels, career positions, teachers, ijazat, and study history must not be inferred from video content, playlists, or the archive.
- If the owner does not supply a fact, the public page should either omit that section or show Arabic "غير متوفر" English "Not available". Do not show placeholder dates, fake institutions, or generic claims.
- Do not add a photo unless the owner supplies one with rights. The existing monogram is enough until then.
- Do not publish any teacher or ijaza claim that is not exact. Omitting a teachers section is better than a vague claim.

Exact questions to ask the owner or the Sheikh's team:
1. What exact Arabic name and English transliteration should appear on the page?
2. What exact role line may we publish, word for word?
3. May we publish birth date and birthplace, or should they be private or omitted?
4. What formal education can be verified: institutions, degrees, years, and locations? Please provide exact wording and source.
5. Who were his teachers? Provide exact names, subjects, periods, and whether each name may be published.
6. Does he hold any ijazat? Provide exact subject, grantor, date, chain text, and permission to publish. If exact details are not available, we will omit the ijazat section.
7. What verified teaching or career positions may be listed, with dates and locations?
8. What verified background milestones may be listed, and what is the source for each?
9. What is the official preferred biography text in Arabic, and is there an approved English translation?
10. Are there facts that must not be published for privacy or accuracy reasons?
11. May we use an official photo or logo? If yes, provide the file and rights confirmation.
12. Who gives final approval on the biography copy and source notes?

(4) Additional improvements/additions, ranked

1. Catalog reconciliation and media preflight
What: Build a reconciliation report that compares app DATA against the YouTube inventory TSVs, resolves the 4,320 vs 4,332 membership gap, resolves the Bukhari 996 vs 1,131 gap, and lists every video's local path status and YouTube ID status.
Where: Data build pipeline and an internal QA screen.
Why it earns its place: Dual playback and trust in counts depend on it. Without it, V5 can ship with wrong memberships, missing IDs, and missing local files.
Acceptance criteria: A repeatable report is generated on every build. Every membership difference is either fixed or documented as an approved exception. The Bukhari discrepancy is fixed or explicitly labeled with owner approval. Counts shown in the app come from reconciled data. Every video has a local status and a YouTube ID status. Score: 5.

2. Owner review workflow for the 7 NEEDS-OWNER-REVIEW playlists
What: Add a simple internal review format for the 7 playlists: Friday sermons, evening lessons, Saturday lessons, community events, summer camp clips, Eid 2021 clips, and English Lectures by other speakers. Each playlist gets an owner decision: curriculum, archive, guest series, or pending.
Where: Catalog metadata and browse or search presentation.
Why it earns its place: These playlists cannot be placed by metadata alone. Forcing them into the curriculum would be inaccurate. The guest and other speaker content must remain ordinary and not spotlighted.
Acceptance criteria: All 71 playlists have an owner approved status. Pending playlists do not appear in the curriculum path. Reviewed archive playlists remain searchable. No new scholars section is created. The English Lectures playlist remains ordinary and is not promoted. Score: 5.

3. V4 verification test matrix
What: Execute and record the unverified V4 items: real MKV playback on the owner laptop, Windows .bat launcher, macOS .command launcher, Safari, Firefox, recitation overlap with real videos, and native Arabic copy review.
Where: QA and release checklist.
Why it earns its place: V4 shipped with known unverified claims. V5 should not build on unknowns.
Acceptance criteria: Each item has a pass or fail with notes. MKV behavior is documented per target browser. Launchers are tested on actual Windows and macOS machines. Recitation never overlaps video audio. A native Arabic reviewer signs off on UI copy. Score: 5.

4. Network guard and offline proof
What: Add an automated browser test and manual checklist that block all non-local origins and prove the app works with the network disabled. Inspect for external fonts, icons, thumbnails, prefetches, and YouTube requests before click.
Where: Build and QA, plus the local server test flow.
Why it earns its place: Zero external requests at runtime is a hard constraint. It is easy to break with a PDF worker, a font, or a thumbnail.
Acceptance criteria: With the network blocked, the app loads, searches, plays local media, reads books, and shows the YouTube link. No external request fires before a user click. A click on YouTube is the only external navigation. Score: 5.

5. Accessibility pass
What: Keyboard, focus, ARIA labels, contrast across 6 themes, reduced motion, player controls, search, and the book reader.
Where: Global shell, player, playlist lists, search, Books, About.
Why it earns its place: A bilingual Arabic-first interface with 6 themes and a reader has many accessibility failure points. It is not optional polish.
Acceptance criteria: Core flows are keyboard operable. Focus is visible on all themes. Reduced motion is respected. Arabic and English labels are announced correctly. The book reader supports keyboard and zoom. No control is icon-only without an accessible name. Score: 4.

6. Performance for the 4,000-video catalog
What: Virtualize long lists, avoid rendering all 3,977 video cards, prebuild the search index, lazy load media surfaces, and keep DOM size stable.
Where: Library, playlist pages, search results, curriculum path.
Why it earns its place: A 4,000-video catalog can become slow and memory heavy if every card is in the DOM.
Acceptance criteria: Long lists render only visible items. Search uses a prebuilt local index. Scrolling and filtering remain smooth on the owner laptop. Opening and closing large playlists does not leak memory. Performance measurements are recorded before release. Score: 4.

7. Search and discovery
What: Add Arabic normalization for diacritics, hamza and alef variants, English title and transliteration search, playlist search, and availability badges for local playback and YouTube.
Where: Global search and browse filters.
Why it earns its place: Search is the main discovery tool for a 4,000-video archive, especially when playlists are not cleanly categorized.
Acceptance criteria: Search finds Arabic titles with and without diacritics and common hamza variants. English transliteration works where metadata exists. Results show local and YouTube availability. No results state is clear. No external search service. Score: 4.

8. Continue watching and resume
What: Store the last playback position per video, show a "متابعة المشاهدة" English "Continue watching" section, and offer resume in the player.
Where: Home or library and video detail.
Why it earns its place: Mark-as-watched exists. Resume is the natural companion for long lessons and makes the archive usable.
Acceptance criteria: Position saves locally after playback. Resume works after reload. Users can clear history. No external sync. Works with local playback and does not fake progress for YouTube links. Score: 4.

9. Metadata and bilingual copy QA workflow
What: Freeze UI strings, run native Arabic review, run English review, test Arabic pluralization, and add an automated check for the em dash character in UI copy.
Where: All UI copy and content labels.
Why it earns its place: V4 native Arabic copy is unverified, and bilingual labels affect every new control in V5.
Acceptance criteria: A string table is approved. Arabic plural tests pass. No missing translation keys. Automated check rejects the em dash character in proposed UI copy. New labels in this plan are reviewed. Score: 4.

10. About facts registry with source notes
What: Store biography claims as structured facts with source, verification status, and owner approval. Public rendering only shows approved facts. Unknown facts are omitted or marked unknown.
Where: About page data.
Why it earns its place: It enforces the no invented biography rule and makes future corrections safe.
Acceptance criteria: Every public biography fact has a source note and approval flag. Teachers and ijazat render only with exact details. Unapproved facts cannot leak into the public page. Score: 4.

11. Hosted flavor capability flag
What: Add a build or runtime capability flag that switches between installed local playback and a future hosted YouTube-first mode.
Where: Build configuration and playback layer.
Why it earns its place: A hosted flavor should not require rewriting playback logic. The installed app must stay offline first.
Acceptance criteria: The installed build has local playback and YouTube links. The hosted build hides local playback or marks it unavailable and uses YouTube as primary. No local path assumptions leak into the hosted build. The hosted build is tested separately. Score: 4.

12. Local progress backup and restore
What: Export and import local JSON for watch progress, bookmarks, and last read page.
Where: Settings or About utility area.
Why it earns its place: Offline local storage can be lost when the browser profile changes or is cleared.
Acceptance criteria: Export creates a local file. Import validates and restores progress. No cloud. No external requests. Clear failure message for invalid files. Score: 3.

(5) Risks / what could go wrong / what to verify before building

- Catalog mismatch risk: The 4,320 vs 4,332 memberships and Bukhari 996 vs 1,131 gap can produce wrong playlist counts, missing lessons, and broken dual playback links. Verify the source of truth and owner decisions before building new UI on top.
- Video ID extraction risk: IDs are said to be in media paths, but the exact catalog schema must be confirmed. Verify what counts as a valid ID and how absent or malformed IDs are represented.
- MKV playback risk: Browsers may not support the MKV codecs on the owner laptop. Verify actual playback in the target browsers. Define the fallback to YouTube and do not promise MKV support before testing.
- Zero external request risk: A bundled PDF viewer, worker, font, icon, or thumbnail can accidentally create an external request. Verify with network blocking and static inspection.
- Books rights risk: The owner must confirm permission to bundle each book and read it offline. Verify file formats, DRM status, and whether any book must be excluded.
- Book reader risk: A PDF viewer may add size and complexity to a single-file app. Verify the bundle and worker strategy before committing. Test large PDFs and scanned PDFs.
- About biography risk: Any unverified fact can become a public error. Verify sources and final copy. Teachers and ijazat must be exact or omitted.
- Accessibility risk: PDFs may be scanned images, and Arabic screen reader behavior varies. Test the reader and player with keyboard and screen readers. Do not claim more than the file supports.
- Performance risk: Rendering 3,977 cards at once will likely fail. Verify virtualized lists and search index size on the owner laptop.
- Safari and Firefox risk: View Transitions, media playback, and PDF rendering may differ. Verify the core flows in both browsers.
- Launcher risk: Windows and macOS launchers are unverified. Test the actual .bat and .command files on the owner machines.
- Recitation overlap risk: Verify with real videos that the silent-by-default recitation never starts over video audio and that its own controls remain separate.
- YouTube maintenance risk: Removed or changed YouTube videos cannot be detected offline. Plan a manual owner update path and a QA list for absent IDs.
- Hosted flavor risk: A future hosted build can accidentally break the installed offline assumptions. Verify the capability flag with a separate test build.

(6) Anything you would explicitly NOT do, and why

- Do not create a scholars section or spotlight any other scholar. The constraint is clear, and the guest playlist stays ordinary.
- Do not add YouTube embeds, iframes, thumbnails, API calls, or prefetches. The hard constraint is zero external requests at runtime, and YouTube is only a user initiated link out.
- Do not auto check YouTube availability or video removal. That would require external requests and would break offline behavior.
- Do not invent book titles, contents, authors, file names, covers, or publication facts. The Books section waits for owner inputs.
- Do not invent biography facts, teachers, ijazat, institutions, dates, or photos. Unknown stays unknown or is omitted.
- Do not replace the bundled CC0 recitation, add AI audio, or autoplay recitation over video audio.
- Do not add purchases, paid keys, third-party clouds, accounts, analytics, comments, social features, or recommendation engines. They do not earn their place in an offline library.
- Do not use the em dash character in UI copy. Use hyphens, commas, or separate sentences.
- Do not add AI credit lines anywhere.
- Do not force MKV conversion or transcoding without owner approval. Verify playback first and fall back to YouTube when local playback fails.
- Do not use fake book covers or generated placeholder images that look like real covers. Use text-only placeholders when no cover is supplied.
- Do not put YouTube links on every card and lesson row. Keep the detail page as the reliable dual playback surface to avoid clutter in a 4,000-video catalog.
- Do not show a public About biography section with vague claims while waiting for facts. Omit or mark unavailable.
- Do not ship a hosted flavor in V5 beyond the capability flag. The installed offline app is the priority.

---

## Coordinator note (not DeepSeek's words)

- One overlap to flag for the verdict: ranked item 8, "Continue watching and resume," partly duplicates v4. Per `v4/TEST-RESULTS.md`, a continue-watching rail already renders once real progress exists; what is genuinely new in DeepSeek's item is per-video playback-position resume. The coordinator should score the resume-position part only, not re-credit the existing rail.
- No playbook §8 DO NOT item was re-vetted or re-bought. DeepSeek's "hosted flavor capability flag" (item 11) is a build flag only, not a hosting purchase or service.
- DeepSeek's answer contains no em dash character (verified by grep) and invents no biography, book titles, or file names.
