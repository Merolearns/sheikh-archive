# DeepSeek voice — V5 design consultation (design-deepseek.md)

- Voice: DeepSeek (independent diagnosis and hole-hunting). Consultation only; nothing built, nothing edited.
- Date: 2026-11-20. Model: deepseek-flash, max-tokens 30000, temperature 1.0, verdict-first prompt.
- Call: single call, reply complete (finish=stop). Usage: 1,791 prompt + 28,156 completion tokens (23,055 reasoning), 29,947 total. No retry needed; no empty reply.
- Sources read first: BRIEF_V5.md (15 items), v5/verdict-20261120.md (decisions 1-18), vetted-playbook.md §§2, 4, 8, and the five research reports (design, round2, round3, content-mapping, v4-improvements).
- Note: the reply below is DeepSeek's verbatim answer. Its proposed UI strings contain no em dash (verified: 0 in the reply). Mentions of "draft"/"pending"/"placeholder" occur only in hole-hunting and verification contexts, never as proposed UI copy.

---

VERDICT

1. LOGIN: Keep the opening verse as the sole visual focus. After the verse and 1px gold line, show a quiet two-option auth stack. Guest is primary, Google secondary. No card, no modal, no email/password fields, no pattern behind verse or auth text. Resolve the “verse alone with one button” tension by changing the rule to “verse plus one primary action plus one quiet secondary entry.” DESIGN: verse line-height 2.0, max width 620px; auth stack max width 360px; buttons 52px tall, full pill, 12px gap; pattern edges only at 4% opacity; primary #121214; one 4px red dot on primary only; focus ring 2px.
2. NETWORK: Before the user taps Google, the opening page makes no external request. Guest and local mode stay zero-external-request. Signed-in mode uses only Google Identity and the library’s own progress API, with no trackers, no remote fonts, no remote avatars, no analytics. YouTube remains lesson-page only under item 13.
3. PROGRESS: On first sign-in, if guest-local progress exists, show the merge prompt before home. Merge is union of started courses plus furthest position per video; completed wins. “Not now” preserves local progress and offers “Merge device progress” later in Settings. Second device follows the same rule.
4. PAUSE FLAG: NO. Item 1 catalog reconciliation is not design-dependent and should continue.

SECTION 1: LOGIN PAGE

DESIGN: Layout order is fixed: verse, gold line, guest button, Google button, helper text. No panel heading. No auth card fill. The verse stays centered. At 390px use 20px side padding, 24px desktop. Auth stack max width 360px. Verse font Amiri Quran, clamp(28px, 6vw, 44px), line-height 2.0. Gold line 72px by 1px. Buttons 52px tall, radius 999px, 16px/1.2 UI font. Helper 14px/1.6, muted text. Focus ring 2px, offset 2px. All targets at least 44px. No pattern behind verse or auth stack; pattern allowed only at top and bottom edges at 4%.

DESIGN: Order is guest first in DOM and visual stack. In Arabic RTL, guest appears first at inline-start. The fixed chrome does not mirror. Language toggle stays in the same corner in EN and AR. Only text blocks switch lang and dir.

Exact strings:

| Element | English | Arabic |
|---|---|---|
| Primary guest button | Continue as guest | المتابعة كزائر |
| Secondary Google button | Sign in with Google | تسجيل الدخول باستخدام Google |
| Helper | No account needed. Guest progress stays on this device. Sign in to sync progress across devices. | لا تحتاج إلى حساب. يبقى تقدم الزائر على هذا الجهاز. سجّل الدخول لمزامنة تقدمك بين الأجهزة. |

DESIGN: Animation choreography: verse fade plus 12px rise over 700ms once per session; gold line scaleX 0 to 1 over 350ms starting at 500ms once per session; auth stack fades in over 200ms at 900ms. No button stagger. No other ambient motion. Under prefers-reduced-motion or reduced-motion toggle, all final states appear instantly, no transform, no draw. No animation on sacred text after the opening state.

DESIGN: Merge prompt is an inline opening state, not a modal. It replaces the auth stack and keeps the verse visible. Heading uses Amiri Bold 22px. Body uses UI font 16px/1.7. Two buttons 52px tall, full width at 390px. Focus moves to the heading. Reduced motion is instant.

Exact merge strings:

| Element | English | Arabic |
|---|---|---|
| Heading | Merge progress from this device? | هل تريد دمج التقدم من هذا الجهاز؟ |
| Body | We found progress saved on this device. Merging keeps the furthest point for each video and all started courses. | وجدنا تقدمًا محفوظًا على هذا الجهاز. يحتفظ الدمج بأبعد نقطة لكل فيديو وبجميع الدورات التي بدأتها. |
| Primary | Merge progress | دمج التقدم |
| Secondary | Not now | ليس الآن |
| Footnote | Your device progress stays saved if you choose Not now. | يبقى تقدم جهازك محفوظًا إذا اخترت ليس الآن. |

DESIGN: After sign-in and after any merge choice, home shows “Continue watching” before catalog content when progress exists. Card width 280px at 390px, 16:9 thumb, 2px progress bar, 12px percent label, one card-level action only. “Started courses” appears below with full-width cards, 2px progress bar, and fraction label. Header shows quiet “Account” for signed-in and “Guest” for guest. No avatar image request. Settings holds “Sign out” and “Merge device progress.”

Exact progress strings:

| Element | English | Arabic |
|---|---|---|
| Welcome state | Welcome back | أهلاً بعودتك |
| Continue rail | Continue watching | تابع المشاهدة |
| Started courses | Started courses | الدورات التي بدأتها |
| Watched label | Watched | مشاهد |
| Manual mark | Mark as watched | تحديد كمشاهد |
| Guest header | Guest | زائر |
| Account header | Account | الحساب |
| Signed-in status | Signed in | تم تسجيل الدخول |
| Settings sign-in | Sign in to sync progress | سجّل الدخول لمزامنة تقدمك |
| Settings merge | Merge device progress | دمج تقدم الجهاز |
| Sign out | Sign out | تسجيل الخروج |
| Offline sync | Progress saved on this device. Sync will resume when connected. | تم حفظ التقدم على هذا الجهاز. ستستأنف المزامنة عند الاتصال. |
| Half-watched example | 50% watched | شوهد ٥٠٪ |
| Course fraction example | 3 of 8 lessons | ٣ من ٨ دروس |

DESIGN: Arabic numerals are Arabic-Indic everywhere, including durations and progress. Arabic pluralization must be correct: ٢ درسان, ٣ دروس, ٨ دروس, ١٢ درسًا. English uses Western numerals. Completion is manual “Mark as watched” plus automatic 95% completion; manual mark overrides. Half-watched means position above zero and below completion. Order Continue rail by most recent watch, then course progress by most recent start.

SECTION 2: WHOLE-PROJECT DESIGN REVIEW

| Surface | Verdict | Exact design decisions |
|---|---|---|
| Opening and login | Changes per item 15 | DESIGN: verse remains top focus, line-height 2.0, one 700ms fade plus rise once per session, gold line 72px by 1px, guest primary 52px, Google secondary 52px, no card, no pattern behind text. |
| Home and hero | Stays, with progress added | DESIGN: painted flat-vector sunset only, never photograph. Hero max height 280px at 390px. Continue rail first when progress exists. Card cap 1500, chunked rendering at 60 cards per chunk, no virtualization. |
| Catalog and search | Stays with state fixes | DESIGN: search input 52px tall, results count shown only when count is above zero. Zero state hides count and shows invitation. Cards single column at 390px, 16px gutter, one primary action per card. Counts carry units, for example ١٢ درسًا. |
| Course and series detail | Stays with progress clarity | DESIGN: overall progress as fraction plus 2px bar, no gold fill. Primary action is Start course, Continue course, or Review course. Lesson rows use quiet 16px checkmarks for Watched. No confetti. No other-scholars section. |
| Lesson and dual playback | Changes for v5 | DESIGN: lesson page only. Player 16:9, max width 960px. Source selector 44px, labels YouTube, Hosted video, Local file. Controls never mirror. Dead native video hidden on error. Local mode makes no external request until user selects YouTube. Missing local file confirmed makes YouTube primary. Format failure keeps local primary with error and source switch. No autoplay with sound. |
| Books | Hidden until approved | DESIGN: no 6th nav item ever. Books appear inside Library only after one approved book plus file. Cards are metadata only. Native PDF reader with Open file fallback. Direct hidden URL returns Page not found with Return home. |
| About | Changes to omit unknowns | DESIGN: one column, max width 680px, body 16px/1.8, headings Amiri Bold. Omit “Dr.” until sourced. Omit unknown fields entirely. No under construction, no غير متوفر, no other-scholars section. Credits include recitation CC0 Aaqib Azeez. |
| Transcripts | New surface | DESIGN: transcript panel below player, max height 60vh, scroll. Tabs 44px: Arabic, English. Body 16px/1.7, max width 680px. Active line uses 2px ink line, never gold fill. At 1024px and above, side-by-side columns; below, stacked tabs. Error state has Try again. |
| Guest state | New visible state | DESIGN: quiet Guest label in header. No persistent sign-in banner. Sign-in invitation lives in Settings and merge prompt only. Guest localStorage keys unchanged. |
| Signed-in state | New visible state | DESIGN: quiet Account label. No remote avatar. Settings shows signed-in status, Merge device progress, Sign out. Account cache uses separate namespace from guest keys. |
| Settings, themes, motion | Stays with audit | DESIGN: six themes are tokens only. Verse contrast at least 7:1, body at least 4.5:1, gold line at least 3:1, focus ring at least 3:1. Theme swatches 3 by 2 grid, 44px by 44px, 8px gap, no clip at 390px. Calm sets pattern to 4% and disables pointer glow and lean. Reduce motion disables all transforms and draw-on line-work. |
| Bottom nav and mobile | Stays with guard | DESIGN: bottom nav 56px plus safe area, 5 equal columns, icon 24px, label 11px/1.2, no wrap. 5th item must not clip at 390px. All targets at least 44px. |
| CTA system | Stays | DESIGN: primary pill #121214, 52px demo height, one 4px red dot, hover 350ms, press scale .97, cursor glow 120px at 8%, magnetic lean max 2px. Pointer only. Glow and lean off under reduced motion and touch. In dark themes, if button-surface contrast is below 3:1, add 1px gold line border, never gold fill. |

SECTION 3: HOLE-HUNTING

1. Contradiction: “verse alone with one button” versus two-option login. Decision: amend rule to “verse plus one primary guest action plus one quiet Google secondary.” No personal data before entry. This is not a generic form.
2. Contradiction risk: zero external requests versus Google sign-in and account sync. Decision: zero-external applies to guest, local mode, and the opening page before Google tap. Signed-in mode allows only Google Identity and the library progress API. No third-party assets, trackers, remote fonts, remote avatars, or analytics.
3. Missing account backend. Owner must decide the account and progress backend before item 15 implementation. Recommended default: Cloudflare Worker plus D1, or Supabase with Postgres RLS. Requirement: per-account row ownership on every table, HttpOnly SameSite cookie, CSPRNG tokens only, no secrets in frontend, RLS-view audit.
4. Missing merge conflict rule. Decision: union of started courses, furthest position per video, completed wins. “Not now” preserves local progress. Settings allows later merge. Do not silently clear guest keys after merge; mark as merged and retain as local backup until sign-out.
5. Second-device sign-in not handled. Decision: if no local progress, load account progress. If local guest progress exists, show merge prompt. If both account and local progress exist, apply union and furthest-position rule.
6. Missing auth failure states. DESIGN: show inline error in auth stack, not a toast. Exact strings: “Google sign-in could not open. Allow pop-ups and try again.” Arabic: “تعذر فتح تسجيل الدخول باستخدام Google. اسمح بالنوافذ المنبثقة وحاول مرة أخرى.” Also: “Google sign-in was cancelled.” Arabic: “تم إلغاء تسجيل الدخول باستخدام Google.” Also: “Could not connect. Check your connection and try again.” Arabic: “تعذر الاتصال. تحقق من اتصالك وحاول مرة أخرى.”
7. Expired session. DESIGN: inline prompt: “Your session expired. Sign in again.” Arabic: “انتهت جلستك. سجّل الدخول مرة أخرى.” Guest entry remains available.
8. Offline signed-in state. Decision: cached account progress remains readable, new progress queues locally, sync resumes when online. DESIGN: quiet inline sentence, no blocking modal. Exact string above in Section 1.
9. Half-watched definition was vague. Decision: started and not complete. Completion is 95% or manual mark. Manual mark overrides. DESIGN: 2px progress bar, Arabic-Indic percent in AR.
10. Course progress denominator was unset. Decision: only published visible lessons count. Hidden and unapproved curriculum items do not count. No “pending” or “under review” placeholder. Unapproved curriculum sections are omitted.
11. Guest nag risk. Decision: no persistent sign-in banner. Guest label is quiet. Sign-in invitation is only in Settings and merge prompt. This preserves first-run calm.
12. Sign-out behavior was unset. Decision: sign out returns to the unchanged guest local namespace. Clear account tokens and account cache. Do not clear guest keys. Exact string: “Sign out” and “تسجيل الخروج.”
13. Google avatar would create an external request and visual noise. Decision: no remote avatar. Header shows “Account” and Settings shows signed-in status. No profile photo.
14. “Sign in with Gmail” wording is imprecise. Decision: exact UI says “Sign in with Google” and “تسجيل الدخول باستخدام Google.” Google sign-in is the provider. Owner may require “Gmail,” but recommended default is Google.
15. Opening choreography regression risk. Decision: no stagger for two buttons. Guest and Google fade together at 900ms. Gold line draw is once per session. Reduced motion is instant. No animation on verse after opening.
16. 390px vertical overflow risk. Decision: allow vertical scroll. DESIGN: min-height 100svh, safe-area padding, auth stack not fixed. At short heights, verse and auth stack scroll normally.
17. Pattern behind verse or auth. Decision: forbidden. DESIGN: pattern only at top and bottom edges at 4% on login. Never behind text, grids, or verse.
18. Search zero state contradiction. Decision: hide results count at zero. Show only invitation. Exact strings: “No results for this search.” Arabic: “لا توجد نتائج لهذا البحث.” and “Try a shorter word or check the spelling.” Arabic: “جرّب كلمة أقصر أو تحقق من الإملاء.”
19. Empty progress state. Decision: invitation, not failure. Exact strings: “Your progress will appear here after you start a lesson.” Arabic: “سيظهر تقدمك هنا بعد أن تبدأ درسًا.” Primary action: “Start with the first lesson” and “ابدأ بالدرس الأول.”
20. 5th nav clipping. Decision: five equal columns, short labels, 11px/1.2, no wrap, 56px height plus safe area. Verify at 390px on all six themes.
21. Theme swatch clipping. Decision: 3 by 2 grid, 44px by 44px swatches, 8px gap, section padding 20px. No labels inside swatches. Verify no clip at 390px.
22. Six-theme contrast. Decision: gate all themes. Verse at least 7:1, body at least 4.5:1, gold line at least 3:1, focus ring at least 3:1. Dark themes may add 1px gold border around #121214 primary button if surface contrast is below 3:1. Never gold fill.
23. Missing local file and format failure were under-specified. Decision: confirmed missing local file makes YouTube primary and hides local source. Format failure keeps local primary, hides dead native video, shows error and source selector. No auto-switch loop. Exact error: “This video cannot play here.” Arabic: “تعذر تشغيل هذا الفيديو هنا.” Action: “Try again” and “إعادة المحاولة.”
24. Offline lesson with no local file. Decision: no dead player. Show “This video is not available offline.” Arabic: “هذا الفيديو غير متاح دون اتصال.” with Try again.
25. Dead native video element. Decision: remove from layout on error. No black rectangle, no native controls, no hidden audio.
26. Transcript load failure. Decision: inline error with retry. Exact: “The transcript could not load. Try again.” Arabic: “تعذر تحميل النص. حاول مرة أخرى.” No placeholder transcript.
27. Recitation and video audio overlap. Decision: enabling recitation pauses video audio. DESIGN: inline sentence: “Video audio paused during recitation.” Arabic: “تم إيقاف صوت الفيديو أثناء التلاوة.” Video audio resumes only by user action.
28. Books hidden route. Decision: no nav, no empty state. Direct URL returns “Page not found” and “العودة إلى الرئيسية.” Do not show “Books are not available yet.”
29. About contradictions. Decision: omit unknowns. Omit “Dr.” until sourced. No “under construction,” no “غير متوفر,” no pending sections. Arabic copy audit has final say.
30. 7 NEEDS-OWNER-REVIEW playlists. Decision: curriculum sections for unapproved playlists are omitted entirely. No placeholder status in UI. This gates curriculum only, not release.
31. LocalStorage safety. Decision: guest keys unchanged. Signed-in cache uses a separate hashed account namespace. Merge reads guest keys, writes account progress, and does not wipe guest keys. Add regression test proving sign-in never removes guest keys.
32. Reduced motion and CTA. Decision: pointer glow, magnetic lean, button scale, gold draw, and verse transform all off under reduced motion. Press state uses background change only.
33. Calm mode. Decision: Calm reduces pattern to 4%, disables pointer glow and lean, keeps 200ms opacity transitions. It does not disable essential state changes.
34. Language toggle position. Decision: fixed same corner in all languages. Chrome and media controls never mirror. Auth text blocks switch dir. Guest and Google buttons follow text dir but keep 52px height and full width.
35. One primary action per card. Decision: Continue cards are single whole-card actions. No secondary buttons inside cards. Lesson rows may have one quiet Mark as watched action.

SECTION 4: VERIFICATION BAR

Zero-error standard: the owner sees no final result until every check below is green. A red check blocks release. The owner-hardware matrix is a release gate.

Codex runs mechanical and consistency sweeps:
- Copy lint: no em dash, no placeholder or draft language, exact AR and EN strings, no “under construction,” no “غير متوفر” where prohibited.
- Arabic numeral lint: Arabic-Indic numerals in Arabic UI, including durations and progress. Arabic pluralization checks for 2, 3 to 10, and 11 plus.
- RTL and chrome lint: language toggle same corner, chrome never mirrors, emblem and media controls never mirror, text blocks switch dir.
- Accessibility lint: 44px minimum targets, 52px primary buttons, focus ring, keyboard order, labels, no clipped 5th nav item, no clipped theme swatches at 390px.
- Motion lint: 200ms to 400ms default, opening verse 700ms once per session, gold draw 350ms once per session, transform and opacity only, reduced motion kills transform, draw, glow, lean, and scale.
- Security lint: no Math.random, CSPRNG only, no secrets in frontend, HttpOnly SameSite cookies, per-account access rules on every table, RLS-view audit, spend caps, CSP connect-src limited to Google Identity and own progress API.
- Network lint: no external request before Google tap, no remote fonts, no remote avatars, no analytics, no trackers, guest and local mode remain zero external.
- Progress tests: merge union, furthest position, completed wins, Not now preserves local, sign-in never wipes guest keys, second-device merge, offline queue and sync.
- State tests: search zero hides count, dead video hidden, missing local file makes YouTube primary, format failure keeps local primary, Books hidden route returns 404, transcript error retry, offline lesson error.
- Catalog tests: TSV source of truth, counts carry units, chunked rendering cap 1500, no virtualization.

Claude Code runs deep review and scholarly judgment:
- Arabic copy audit with final say on all AR strings, including merge, error, empty, and progress copy.
- Sacred text review: verse line-height 2.0, no animation beyond the one allowed opening fade plus rise, no pattern behind verse, text outranks decoration.
- Scholarly and About review: no other-scholars section, no unverified “Dr.,” no unknowns, no placeholders, correct recitation credit.
- Design restraint review: 60-30-10, gold is a line not a fill, one primary action per card, no gamification, quiet checkmarks.
- Adversarial review of login tension, merge behavior, guest versus signed-in states, and all six themes.
- Security architecture review against playbook §4 gates.

Other voices tighten the gate:
- Accessibility auditor: screen reader order, keyboard-only login and merge, focus management, reduced motion, contrast in all six themes, 390px actual device.
- Security auditor: OAuth flow, token handling, per-account row ownership, RLS-view audit, CSP, CSPRNG, spend caps, no secrets.
- Performance reviewer: chunked rendering, 1500-card cap, no virtualization, transcript and PDF load behavior.
- Owner hardware matrix: iOS and Safari video fullscreen, Google OAuth popup or redirect, PWA offline, 390px devices, six themes, Books PDF Open file fallback.

SECTION 5: PAUSE FLAG

PAUSE FLAG: NO. The V5 build is on item 1 catalog reconciliation, which is not design-dependent. None of these decisions change the TSV source of truth, catalog counts, or reconciliation order. Do not pause item 1. Do pause before item 15 implementation until the owner confirms the account and progress backend, the allowed network domains, and the Google versus Gmail button label. Recommended defaults: Cloudflare Worker plus D1 or Supabase with RLS, allowed domains only Google Identity and own progress API, button label “Sign in with Google,” guest-first order, union plus furthest-position merge, and “Not now” preserving local progress.