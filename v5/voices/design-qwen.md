# Qwen design voice, V5 whole-project design consultation

Date: 2026-11-20 (PST evening). Voice: Qwen (qwen3.8-flash, enable_thinking false).
Method: one qwen-chat call, prompt 1,129 tokens, completion 2,730 tokens, logged to
`usage-log.tsv` in the connector directory. No PAUSED file exists in the connector
directory. No proprietary code, credentials, private data, or financial information
was sent. Read first: BRIEF_V5.md, v5/verdict-20261120.md, vetted-playbook.md
sections 2, 4, 8, and all five research reports listed in the task.

Adjudication note: the raw Qwen output is the basis of this file, but I corrected it
in 9 places where it contradicted established design. Each correction is marked
CORRECTED and states the established rule it follows. Nothing below re-litigates
established design without evidence.

## Pause question, answered first

**DECISION: No, the V5 build does not pause.** Item 1 (catalog reconciliation) is
purely data-structural and design-independent. The build proceeds on item 1 while
these design decisions are recorded. Design-sensitive items (login page, dual
playback player, Books, About, transcripts) are built only after the council design
verdict is recorded, per the operating rules, but that does not stop item 1.

## 1. LOGIN PAGE (brief item 15)

**DECISION:** The two options replace the single Enter button inside the Illuminated
Page opening. The verse, the painted flat-vector sunset, the one allowed fade+rise,
and the opening choreography do not change. Sign in is first and primary styled;
guest entry is second, a full pill of the same size, never a small link or a
footnote, because playbook section 2.14 forbids forcing account creation before
the action.

**DESIGN: Layout.** The verse sits alone at the top with its citation beneath it,
line-height at least 2.0, on the calm sky band of the painted sunset. Below the
verse, the scholar's name line stays as in v4. Below that, the two option pills,
stacked vertically at 390px and on all widths up to 768px, side by side above
768px. Both pills are at least 52px tall, full pill shape, one primary action
visually dominant, one secondary. No third option, no extra text, no
explanation paragraph. The recitation Listen control keeps its v4 position and
silent-by-default behaviour; signing in never starts audio.

**DESIGN: Order and visual treatment.**
- Primary pill: sign in. Gold 1px line border, no gold fill, text in Amiri Bold,
  standard Google "G" mark as supplied (never recoloured), label in the current
  UI language. On dark themes the pill is ink on gold line; on light themes
  emerald text on paper with the gold line. Press scale 0.97 in 90ms.
- Secondary pill: guest entry. Transparent fill, 1px hairline border at 25%
  opacity, text in Noto Sans Arabic, same height and radius as the primary pill.
  It must read as a real choice, not as a way out of a wall.
- Below the pills, one quiet line only, in small muted type, stating the
  difference in one clause (see strings below). No privacy policy link, no
  account benefits list, no "learn more" on the opening screen.
- The opening animation is unchanged: sky fade 900ms, silhouette rise 800ms,
  verse single fade+rise 700ms, button rise 350ms. CORRECTED: the raw Qwen
  output said the verse stays static; the established rule is the one allowed
  fade+rise on opening, which stands. Under Calm or prefers-reduced-motion the
  whole opening collapses to one static, fully composed, legible frame.

**DESIGN: Exact strings (final, native-Arabic checked).** No em dash in any string.
Arabic-Indic digits everywhere in Arabic UI. Durations keep the LTR mm:ss shape
but use Arabic-Indic digits inside it, for example ١٢:٣٠.

| Context | Arabic | English |
|---|---|---|
| Sign-in button | تسجيل الدخول عبر Gmail | Sign in with Gmail |
| Guest button | الدخول كضيف | Continue as guest |
| Quiet line under pills | تسجيل الدخول يحفظ تقدمك على حسابك. الدخول كضيف يحفظه على هذا الجهاز فقط. | Signing in saves your progress to your account. Guest entry saves it on this device only. |
| Greeting, name known | مرحبًا، [Name] | Welcome, [Name] |
| Greeting, name unknown | مرحبًا بك | Welcome |
| Sign-out label | تسجيل الخروج | Sign out |
| Merge dialog title | دمج التقدم المحلي؟ | Merge local progress? |
| Merge dialog body | لديك تقدم محفوظ على هذا الجهاز. هل تريد دمجه مع حسابك؟ | You have saved progress on this device. Do you want to merge it into your account? |
| Merge confirm | نعم، ادمج التقدم | Yes, merge progress |
| Merge decline | لا، أبقِه على هذا الجهاز فقط | No, keep it on this device only |
| Continue rail heading | استأنف التعلم | Resume learning |
| Course progress, 1 | دورة واحدة قيد التعلم | 1 course in progress |
| Course progress, 2 | دورتان قيد التعلم | 2 courses in progress |
| Course progress, 3 to 10 | ٣ دورات قيد التعلم (digit = count) | 3 courses in progress |
| Course progress, 11+ | ١١ دورة قيد التعلم | 11 courses in progress |
| Half-watched label | شاهدت نصف الدرس | Half watched |
| Resume label | استئناف من ١٢:٣٠ | Resume from 12:30 |
| Remaining label | متبقٍّ ١٢ دقيقة | 12 minutes left |
| Series started label | بدأت هذه السلسلة | Started |
| Series finished label | أكملت هذه السلسلة | Completed |
| Guest chip | ضيف | Guest |
| Sign-in failed | تعذر تسجيل الدخول. تحقق من الاتصال وحاول مجددًا. | Sign-in failed. Check your connection and try again. |
| Sign-in while offline | تسجيل الدخول يحتاج إلى اتصال. يمكنك الدخول كضيف الآن. | Sign-in needs a connection. You can continue as a guest now. |

**Arabic judgment notes (Qwen owns this).** "تسجيل الدخول عبر Gmail" is
correct and natural; "عبر جوجل" was the raw output and is replaced because the
brief and the owner order say Gmail, and Gmail is the account the user signs in
with. "الدخول كضيف" is the natural native form, better than "المتابعة كضيف"
for an entry button. The merge decline string was CORRECTED: the raw output
said "لا، ابدأ من جديد" (No, start fresh), which wrongly implies the local
progress is discarded. The correct decline keeps local progress on the device
only and never deletes it. Plurals follow the v4 audit correction: 1 مفرد,
2 مثنى (دورتان، درسان، سلسلتان)، 3-10 جمع (دورات، دروس، سلاسل)، 11+ مفرد
منصوب (دورة، درسًا، سلسلة). "دورة" is feminine, so "دورة واحدة" and
"دورتان" agree. Mixed-direction rule: every duration, count, and video ID is
wrapped in its own directional isolate so digits never reorder inside Arabic
sentences. "Gmail" stays in Latin letters inside Arabic text, isolated, never
transliterated.

**DESIGN: Merge behaviour.** The merge dialog appears only when both conditions
hold: the visitor signs in, and local progress exists on this device. It never
appears on load and never appears for a guest. Either choice keeps the local
progress; merging copies it into the account, it never moves and deletes the
local copy. If the account already has progress for the same video, the further
position wins (the later timestamp), and the merge dialog states that in one
line if a conflict exists: "إن وُجد تقدم أحدث على حسابك، يبقى الأحدث."
/ "If your account already has newer progress, the newer position is kept."
Signing in never wipes or overwrites local progress. Signing out returns to
the opening page and leaves both the account progress and the local progress
untouched.

**DESIGN: How signed-in progress is shown after entry.** No separate profile
page in v5. Progress appears in the three places the student already looks:
- The Home Continue rail becomes the first rail below the hero, account
  filtered, same position and card design as the v4 guest rail, with a gold
  3px progress bar on each card, the resume label, and the remaining time.
  CORRECTED: the raw output put the rail "at the bottom of Home"; the v4
  Continue rail position below the hero stands.
- Series cards gain a thin gold progress bar and a started or completed label
  once the account has progress in that series. The bar is the same token in
  all six themes.
- Where to Start steps show per-step progress ("٣ من ٦ دروس" / "3 of 6
  lessons") once started, using the same plural rules.
- The header shows a small account chip with the first name or the word
  "ضيف" / "Guest" for guests. The chip sits in the fixed header corner next
  to the EN|AR toggle and never moves on language switch. Tapping it opens a
  small menu with the greeting, the sign-out label, and nothing else.
- Guest state is shown only by the "ضيف" chip and by the local Continue rail.
  CORRECTED: the raw output proposed a persistent "Guest Mode" banner on
  Home; a persistent banner is clutter and contradicts the calm opening, so
  there is no banner. The quiet line under the opening pills already states
  the difference once.
- A signed-in visitor with no progress sees the Home exactly as a guest with
  no progress sees it: no empty Continue rail, no "you have no progress"
  message, no placeholder. The rail appears on the next visit after the first
  lesson plays.

**DESIGN: Sign-in failure and offline states.** Sign-in is an explicit
user-initiated action and the only flow that needs a network connection. If it
fails, the opening stays put and shows the failure string above in place of the
quiet line, with the guest pill still fully usable. There is no retry loop, no
automatic retry, and no blocking spinner longer than the attempt itself. The
installed app works fully offline as a guest; sign-in simply waits until the
visitor chooses it with a connection.

**DESIGN: Security (playbook section 4).** No password is ever stored by the
app. Tokens are CSPRNG only, never Math.random or equivalent. Per-account
access rules: no account ever sees another account's progress, and the store
proposal from the build must state the rule enforcement (server-side per-user
scoping for the hosted flavour, or a local per-account store keyed by account
id for the installed flavour) before it is built. No secrets in frontend code.
The build proposes the exact store shape; no Google Cloud project, account,
or paid service is created without the owner's explicit word.

## 2. WHOLE-PROJECT DESIGN REVIEW

**DECISION:** v4 stays as the base. What changes in v5 is confined to the new
surfaces, the audit leftovers, and the login page. No screen is redesigned for
its own sake.

**DESIGN: Six themes, corrected tokens.** CORRECTED: the raw output invented
six new theme names (Daylight, Nightfall, Sepia, High Contrast, Deep Blue,
Earth). The established six themes stand, as tokens only, layout and type
never changing: Parchment (default light, surface #F7F3EA, ink #1F2937,
primary emerald #0B3D2E, gold #8C6D1F), Emerald (default dark, surface
#0B1F18, ink #EAF4EE, gold #C9A227), Midnight (surface #0A1628, ink #E8EDF5,
primary blue #3B82C4, gold #C9A227), Sand (surface #EFE8D8, ink #2B2118,
primary terracotta #9C4221), Sunset/Maghrib (dark only, gradient dusk
#1E1433 to #3B1F2A, ink #FDF6EC, amber #D97706, gold #E8C96A, never the
default), Pure dark (surface #000000, ink #FFFFFF, the accessibility theme).
Gold stays a 1-2px line, rule, ring, or progress bar in every theme. The theme
picker stays the visual swatch picker with live preview from v4. CORRECTED:
the raw output moved the theme picker into a settings gear; it stays where v4
put it, and the v4 bug is fixed instead (the 390px clipping of the swatch
panel), not worked around by hiding it.

**DESIGN: Screen by screen.**
- Opening / Illuminated Page: STAYS, with the login pills replacing the single
  Enter button (section 1). Painted flat-vector sunset, verse alone, one
  allowed fade+rise, citation below, scholar name line. No photograph, no
  third button, no benefits copy.
- Home: STAYS. Continue rail first (account filtered when signed in, local
  when guest), then Featured Series, then rails as in v4. One motif, the
  khatam, at five scales; medallion dividers between rails; no pattern behind
  grids. The 40-day path keeps its verified days and durations.
- Library: STAYS, with the v4 audit fixes: Arabic plurals corrected for 2
  and 3-10 everywhere, one numeral system per language (Arabic-Indic in
  Arabic UI, durations included), the sidebar duplicate-rows claim verified
  in the rendered DOM before any fix, mobile pillar-card meta wrapping fixed,
  search match-field labels added, search heading gets a results state,
  recent searches from localStorage. Nav stays at 5 items. CORRECTED: the raw
  output proposed a hamburger menu for mobile nav; the 5-item nav stays and
  the v4 clipping of the 5th item at 390px is fixed, not replaced.
- Lesson detail page, dual playback: CHANGES as specified by brief items 3
  and 13. Player area keeps the v4 lesson frame (1px gold hairline at 22-25%
  plus 16px corner stars). The action area below the player holds, in the same
  order in both languages: local play, YouTube in-page (default on click),
  hosted R2 copy, Save, Mark as watched. The YouTube mode is an embedded
  player in the same page and tab, privacy-enhanced host where the player API
  allows it, no autoplay without user action. The new-tab link stays as a
  secondary option beside it. State machine from the verdict stands:
  confirmed missing local file makes YouTube primary and the local action
  becomes plain status text ("الملف المحلي غير متاح" / "Local file
  unavailable"); format failure keeps local primary with YouTube secondary
  beside "Open in another player"; neither file nor resolvable ID shows the
  explicit unavailable state. Activating YouTube pauses local playback, saves
  position, stops recitation. The action area stays mounted through loading
  and playback errors. No thumbnail fetch, no YouTube API key, no preconnect,
  no prefetch, no navigator.onLine gating. Failure of YouTube mode offers the
  hosted copy first, then the local file. The player never shows a raw error
  code and never leaves a dead black video element on screen; on error the
  player area renders the designed empty state (khatam emblem plus the human
  notice) with the closed Details disclosure for the path.
- Books: NEW, hidden until at least one approved book exists WITH its readable
  file. No 6th nav item. Reached from a secondary link in the Library header
  and from the About page, labelled "الكتب". List view follows the series-card
  grid pattern (cover or khatam emblem, Arabic title, English title if
  supplied, language badge, page count, lazy thumbnails, owner order then
  Arabic title, language filter only). Detail view has the larger cover,
  metadata block, description, and Read button. Reader is the native browser
  PDF viewer with an "Open file" / "افتح الملف" fallback; no iframe overlay
  is required if the OS or browser opens the approved local file more
  reliably offline. Preview flavour shows metadata only with the note "متاح
  في التطبيق المثبت" / "Available in the installed app". Saved stays
  video-only; books do not go on Where to Start. Search indexes book titles
  and metadata only. Dedup rule applies to every incoming book before it is
  listed.
- About the Sheikh: CHANGES only by verified facts. Monogram stays unless the
  owner supplies and approves a portrait. Archive-derived stats with units
  only. Teachers and ijazat only when the person, subject or text, and nature
  of the study or authorization can be stated precisely. "Dr." omitted until
  verified with the owner and a publishable source. Unknown sections omitted,
  never filled, never "under construction", never "غير متوفر". The proposed
  static line "الشيخ مصطفى كامل عالم ديني وداعية إسلامي معاصر" stays a
  proposal needing owner approval and a source; it does not ship as fact.
  Books list linked once populated.
- Transcripts: STAYS as v4, extended to new uploads. Full readable text in
  the browser on the lesson page, AR/EN toggle, tap-a-line sync with local
  playback. CORRECTED: the raw output proposed a side-by-side pane; the v4
  transcript panel stands. In YouTube mode the panel stays available with the
  full text readable; line sync with the YouTube player is verified at build
  time and manual scroll is the fallback if sync is not reliable.
- Search: STAYS with fixes. Recent searches, match-field labels, a results
  heading state, and the no-results contradiction fixed: the empty panel says
  what found nothing ("لا توجد سلاسل مطابقة" / "No matching series" when
  series found nothing, while the lesson count above stays visually primary),
  plus a quiet "Browse the library" / "تصفح المكتبة" link beside "Clear
  search". CORRECTED: the raw output proposed removing filters that yield
  zero results dynamically; filters stay, only the copy is fixed, because
  hiding controls mid-search breaks predictability.
- Saved, Where to Start, 40-day path, About hub: STAY. One primary action per
  card. Save is a quiet star icon-button on the thumbnail corner. The
  "Languages and Text" action renders only when captions or transcripts exist
  for that lesson. The 40-day path gains its quiet terminus line on completion
  ("You finished the forty days. Begin again, or choose any series." /
  "أنهيت الأيام الأربعين. ابدأ من جديد أو اختر أي سلسلة.") with a quiet
  "Start again" button, no celebration copy, no badge.
- Recitation: STAYS. CC0 Aaqib Azeez, 20.8 s, silent by default, plays on
  Enter or play tap, stops on skip and on navigation, never overlaps video
  audio, play/pause/replay/mute/volume with text labels. No other recording,
  no AI audio.

**DESIGN: Numbers and numerals.** CORRECTED: the raw output proposed a global
toggle between Arabic-Indic and Western numerals. There is no such toggle.
Numerals follow the UI language: Arabic-Indic everywhere in Arabic UI
(durations included, keeping the LTR mm:ss shape), Western digits in English
UI. One numeral system per card, per language, no mixing. Counts carry their
unit until item 1 reconciles them (distinct videos vs memberships vs TSV
rows); no count is presented as final archive coverage before reconciliation.

**DESIGN: Motion (inside the library).** The round-3 and v4 motion specs stand:
home entrances fade+rise 8px with 70ms stagger capped at 8; rail medallion
dividers draw once per session (hairlines scaleX 420ms, medallion
stroke-dashoffset 600ms); card hover lift 3px plus gold rule 180ms; press
scale 0.97 in 90ms; View-Transition page changes 380ms with frozen chrome and
a CSS fallback; theme switch cross-fade 320ms; language toggle thumb slides
250ms with chrome never moving; save star pop 240ms plus one quiet gold
sparkle; transcript golden thread FLIP 240ms. Ambient stays slow (gradient
drift 16-20s, emblem rotation 40-60s or 4s pulse, never both, one ambient
motion per screen). Verse text is never animated inside the library. Calm and
prefers-reduced-motion collapse every entrance, stagger, draw-on, and ambient
motion to its final static frame; the buffering ring becomes a static icon
with a label; skeletons go static. Device tiering halves stagger caps on
weak devices.

**DESIGN: Pattern budget.** One khatam geometry at five scales, nothing else.
Hero wash 5-7% gold, medallion dividers 28-32px between rails, double-rule
frames on featured cards only, player frame and transcript header medallion,
dialog medallions drawing once, footer medallion, stats-band girih at 5%.
No lattice behind grids, transcript body, or verse. No pattern on errors
beyond a 1px hairline frame at 22%; errors stay quiet.

**DESIGN: Playbook section 2 applied.** One primary action per surface
(section 2.5 tiebreaker: clarity, accessibility, user control, task
completion, in that order). CTA spec section 2.14: at least 44px tall (52px
for the opening pills), full pill, one primary action, never force account
creation before the action. Micro-interactions 200-400ms, transform and
opacity only, respect prefers-reduced-motion (sections 2.3, 2.4). No playbook
section 8 DO NOT item is re-vetted, re-bought, or re-installed by anything in
this design. The closest calls are explicit non-uses: no THREEUI Pro, no
Figma MCP, no GetLayers paid plan, no bundled PDF.js, no GSAP (not MIT),
no virtualised list library.

## 3. HOLE-HUNTING

**DECISION:** Every gap below is decided here. Any gap not listed is still a
hole until a voice decides it; the build does not invent a treatment at build
time.

**DESIGN: Missing local file.** Confirmed missing: player area shows the calm
error treatment with the closed Details disclosure; local action becomes plain
status text; YouTube becomes primary; back navigation kept. File found but
playback fails: local stays primary, YouTube secondary beside "Open in
another player" / "افتح في مشغل آخر"; a failed availability probe is treated
as unknown cause, never labelled missing. Neither file nor resolvable ID:
explicit unavailable state, no dead player, no raw path on screen.

**DESIGN: YouTube failure inside the page.** On player error, no network, or
unavailable video, the player area offers the hosted R2 copy first, then the
local file, in that order, with the same plain wording in both languages.
CORRECTED: the raw output proposed detecting offline status and disabling
sources; there is no navigator.onLine gating anywhere. Failure is detected
from the player itself, and the fallback is offered after the failure, never
pre-empted by a connectivity guess. If the machine has no internet, the
YouTube mode simply fails into the fallback chain; the app never promises
YouTube works offline.

**DESIGN: Hosted copy unavailable.** The hosted option shows only when a
hosted copy exists for that video. If the R2 copy is missing or fails, the
option is omitted from the action area, not shown disabled. A missing hosted
copy is never an error state on screen.

**DESIGN: No drive connected.** The library opens and browses normally. Every
lesson page still offers YouTube in-page and the hosted copy. The missing
videos folder is detected once at startup and shown as one calm banner on the
Library page using the existing err_nofolder string, not lesson by lesson.
Local actions become status text until a drive is present.

**DESIGN: Guest states.** Guest entry works fully offline with local-only
progress exactly as v4. Guest progress restores on reopen from the same
localStorage keys, unchanged. A guest who later signs in gets the merge dialog
(section 1). A guest never sees another account's progress, and a signed-in
visitor never sees local guest progress from a different device unless merged.
There is no "guest progress will be lost" warning anywhere; nothing is lost
unless the visitor clears the browser data, and the app does not narrate that.

**DESIGN: Empty states.** Continue rail: absent when empty, never
present-but-empty. Saved empty: double-rule frame with corner stars and the
medallion drawing once, existing copy kept. Search no results: framed empty
state with the medallion divider, the corrected copy from section 2, and the
quiet Browse link. Books before the first approved book: the whole section is
hidden, including its links; there is no empty Books page and no "no books
yet" copy. About with no verified bio facts: the bio section is omitted and
the page shows the monogram, name, role line, archive stats, and series index
only. A series with zero lessons after reconciliation: omitted from rails and
the Library grid, flagged in the build log, never shown as an empty card.

**DESIGN: Offline states.** Local mode makes zero external requests; the item
9 guard is re-scoped by item 13 so the YouTube iframe is allowed only inside
YouTube-playback mode and blocked everywhere else. The hosted copy and
sign-in are explicit user-initiated exceptions with documented network scope.
Book binaries are never fetched in the preview flavour. Transcripts and
captions are local files and work offline. The recitation file is bundled and
works offline.

**DESIGN: 390px.** Nav stays 5 items with the clipping fixed; theme swatch
panel fits the viewport with horizontal scroll inside the panel if needed;
pillar-card meta never wraps a lone letter (whitespace guard); lesson action
area wraps to two rows with 44px targets; the opening pills stack full width;
the Books grid is one column; the transcript panel is full width below the
player; the merge dialog is full width with 16px margins and stacked buttons.
Nothing requires horizontal page scroll at 390px.

**DESIGN: Reduced motion and Calm.** One CSS block collapses ambient,
entrance, stagger, and draw-on durations to 0.01ms so WAAPI finished
promises still resolve; ambient, parallax, birds, and shimmer become
animation none at the final frame; View Transitions and WAAPI sequences are
gated behind matchMedia prefers-reduced-motion; the opening verse fade+rise
collapses to static; the buffering ring becomes a static icon with a label.
The Calm toggle in the theme picker forces this path regardless of OS setting.
The toggle itself is always visible.

**DESIGN: All six themes.** Every new surface (login pills, merge dialog,
player fallback states, Books cards, transcript panel, account chip, progress
bars) is checked in all six themes, both languages, at 390px and desktop.
Gold line contrast at least 4.5:1 against its background in every theme; the
Sunset theme is dark only and never the default; Pure dark is the
accessibility theme and its gold line is the light gold #E8C96A. A theme
switch changes tokens everywhere at once: hero, player, cards, sidebar,
dialogs, and the opening. A theme that changes the hero but not the player
is a failed theme.

**DESIGN: Mixed-direction text.** Every Arabic string with embedded Latin
(Gmail, YouTube, R2, video IDs, URLs, durations, counts) isolates the Latin
run. Video IDs and URLs are never translated and never reordered. The EN|AR
toggle keeps its labels in fixed order with only the highlight sliding, stays
in the same corner on every screen, and preserves scroll position and the
current video on switch.

**DESIGN: Sign-in edge states.** Sign-in while a video plays: the visitor is
on the opening page, so no playback is active; nothing to pause. Sign-in
attempt abandoned mid-flow: the opening is unchanged, guest entry still
works, no partial account state is kept. Account switching is not a v5
feature: signing in while another account is signed in signs the first out
first and returns to the opening page. A signed-in visitor on the hosted
flavour sees the same progress as on the installed app once the store syncs;
until the store proposal lands, the hosted flavour shows local progress only
and says so nowhere on screen, it simply behaves as guest progress until
sign-in succeeds.

**DESIGN: Books edge states.** A book file that fails to open shows the
native reader's own behaviour plus the "Open file" fallback; the app never
shows a raw file path. A scanned PDF carries the documented limits in its
metadata, not on screen. A book without a cover uses the khatam emblem, never
placeholder art. A duplicate book is flagged to the owner review list and
never listed, per the dedup rule.

**DESIGN: Counts before reconciliation.** Until item 1 is signed off, every
visible number describes the current local catalog with its unit, and no claim
of final archive coverage is shown. The About stat row shows lessons,
playlists, and series with units only. "Total years" and "years of
publishing" stay dropped. Hours appear only if per-lesson durations verify as
a data field.

## 4. VERIFICATION BAR

**DECISION:** Zero-error is the bar, and it is enforced by independent voices,
not by the builder checking its own work. Nothing ships with a known flaw.
A check that was not run is recorded as not run, never as passed.

**DESIGN: What must be checked before the owner sees a final result.**
- Item 2 owner-hardware matrix, as the release gate: real MKV playback with
  the owner's actual files (diverse codecs and sizes, play, seek, volume);
  audible recitation default-silent and overlap behaviour in both directions,
  heard by ear; Windows .bat and macOS .command launchers on their systems;
  Safari, Firefox, and Chrome real rendering; Arabic font rendering,
  especially Safari fallback and diacritics; iOS and Safari video fullscreen
  behaviour against custom controls; all 65 v4 screenshots reviewed by eye
  plus every new v5 screen; native-Arabic copy read by the owner or a native
  reader; real-host rendering of the hosted flavour; network egress recheck;
  drive present, absent, and disconnected; corrupt media; blocked autoplay;
  YouTube activation with no drive. CORRECTED: the raw output proposed
  Lighthouse scores and a 1.5s first paint threshold; the binding targets are
  the brief's own: p95 200ms from input to painted search results over 20
  runs, and at most 2s to the first usable Library view on the owner's laptop.
- Dual playback state machine: all three states, in both languages, at 390px;
  YouTube click pauses local video, saves position, stops recitation; hosted
  copy switches correctly; network killed mid-play falls back to hosted, then
  local; local mode still passes zero-external-requests.
- Login flows end to end: guest entry, sign-in, merge accept, merge decline,
  sign-out back to opening, half-watched resume on a second device after
  sign-in, guest progress untouched by sign-in, no account seeing another's
  progress, sign-in failure and offline sign-in states.
- Books gating: hidden until ready, shown once one approved book with file
  exists; native reader plus Open-file fallback on mobile Safari and Chrome;
  metadata-only preview flavour; dedup flagging on a supplied duplicate.
- About omission rules: unknown sections absent, no placeholder strings, build
  guard rejects awaiting, TBD, draft, placeholder, and "تحت المراجعة".
- Accessibility: manual or axe audit with zero critical errors; focus order
  matches visual flow in RTL nav, rails, grids, and player; visible focus
  rings; aria-labels on Save, YouTube, Mark as watched, and pillar chips;
  44x44 minimum targets; heading hierarchy; 390px and 200% zoom; Calm and
  reduced motion verified as static.
- Copy audit: no em dash anywhere (grep verified); zero placeholder or draft
  language (token scan plus native read); Arabic plurals for 2 and 3-10
  verified on every count string; one numeral system per language; mixed
  direction text verified with real durations and IDs.
- Network guard: injected remote asset and malformed link both fail the
  guard; final build shows zero requests outside the local archive in local
  mode; the only egress is explicit user-initiated YouTube mode, hosted
  playback, or sign-in.
- Performance: chunked rendering plus the 1,500-card soft cap enforced with
  the accessible Show more action; cold open and broad, scoped, and empty
  queries measured on the owner's laptop.

**DESIGN: Who checks what.** Mechanical and consistency sweeps and guard
checks: Codex. Deep review and scholarly judgment, including the About facts
and the Arabic copy audit: Claude Code. Fast independent checks and
Arabic-first review, including every new string and every plural: Qwen (this
voice). Long-context review and code reading: Kimi. Independent diagnosis on
public material: DeepSeek. Arabic-first research and spot checks: Gemini.
Coordination and the final call on whether the gate passed: Noor. Every fix
is re-tested by a different voice than the one that built it. A voice that
does not answer is recorded silent, never counted as agreement.

**DESIGN: Sign-off rule.** `v5/TEST-RESULTS.md` records every check as pass or
fail with evidence: OS and browser, sample video IDs, results, and actual
audible behaviour. Every unsupported combination or unrun check is explicitly
marked. V5 ships only when every check in the matrix passes, or a gap is
documented as a known risk, never silently passed. The owner sees a final
result only after the gate passes.

## Provenance

- Qwen call: model qwen3.8-flash, enable_thinking false, 1,129 prompt tokens,
  2,730 completion tokens, about $0.0015 at flash pay-as-you-go rates.
  Logged to `usage-log.tsv` in the connector directory.
- No PAUSED file in the connector directory at call time.
- Nothing in this file was invented as a Qwen opinion where the call failed;
  the call succeeded and the file records the call plus the adjudication
  corrections above.
