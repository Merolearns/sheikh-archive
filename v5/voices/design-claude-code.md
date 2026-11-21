# Design council voice: Claude Code (decision-taker)

**Date:** 2026-11-20 ~20:15 PST
**Provenance:** Answered live via the Claude Code CLI (`~/.claude-npm/bin/claude -p --output-format text`), single call, exit 0. This is a real Claude Code decision, unlike the earlier planning round where the CLI reported a 5-hour session limit. The CLI was instructed not to read files; it answered from the established design supplied in the prompt (BRIEF_V5.md, verdict-20261120.md decisions 1-18, vetted-playbook §§2/4/8, five research reports) as read by the coordinator. The Google sign-in, YouTube-embed, and iOS points below are the CLI's expectations, not tested facts; each needs a real browser test before anyone relies on it.

## Two blockers first

**B1. Google sign-in cannot work from a single file opened offline. Owner decision needed before item 15 is built.**
- DESIGN: Google sign-in only accepts web origins (http or https) that are registered with Google. A file opened straight from disk (`file://`) is not one, and sign-in always needs a connection. Needs verification on the target browser, but expected to fail.
- DESIGN: Signing in only adds value if progress follows the person to other devices, and that needs a small server-side store. Building one is new infrastructure, so the owner must approve it, free tier only.
- **Recommendation:** if the owner approves a sync store, build sign-in as specified below. If not, cut sign-in, ship guest-only with progress saved on the device, and hide nothing behind an account. A sign-in that does nothing a guest can't do is a flaw.

**B2. YouTube embeds may fail from a local file. Needs verification on the target machines.**
- DESIGN: YouTube embeds have been refusing pages that send no referrer, and local files send none. Test this on Chrome, Edge and Safari before item 1's output feeds the player.
- DESIGN: If it fails, the player switches by itself to the next source that is available (hosted copy, then local file) and shows one line: "تعذّر تشغيل YouTube هنا. جارٍ التشغيل من نسخة محفوظة." / "YouTube can't play here. Playing a saved copy."

---

## 1. Login page

**Verdict: guest is the primary button and Google is the secondary one, both inside the Illuminated Page opening. Neither waits on the animation.**

**Layout at 390px (DESIGN), top to bottom, centered:**
- Kufi emblem.
- Verse, Amiri Quran, 28px on mobile and 36px on desktop, line-height 2.2. It gets the single allowed fade and rise, 400ms.
- Sheikh's name in Amiri Bold, 22px.
- 32px gap, then a stack of two buttons:
  - full width, max 320px, 52px tall, pill radius, 12px gap between them
  - the buttons are clickable from the first frame and never wait for the fade.

**Buttons (DESIGN):**

| Order | AR | EN | Treatment |
|---|---|---|---|
| 1, primary | ادخل زائرًا | Continue as guest | Filled with the theme's ink token, text in the background token, 1px gold hairline. |
| 2, secondary | تسجيل الدخول باستخدام Google | Sign in with Google | Neutral outline, follows Google's button branding rules. Label says Google, not Gmail. Verify against Google's current branding page. |

- Note under the buttons, 15px, muted token (DESIGN):
  - AR: "يُحفظ تقدّمك على هذا الجهاز. سجّل الدخول لحفظه في حسابك."
  - EN: "Your progress is saved on this device. Sign in to keep it with your account."
- Offline (DESIGN): the Google button stays in place but is disabled, and its label reads "يتطلب اتصالًا بالإنترنت" / "Needs an internet connection". The layout never shifts.
- Return visits (DESIGN): skip the opening and go straight to Home. The opening comes back on sign-out or from the emblem.

**Progress after entry (DESIGN):**
- Thresholds:
  - "in progress" means more than 30 seconds watched and less than 90% of the video
  - 90% or more counts as watched and shows a check mark.
- Home row 1 is "تابع المشاهدة" / "Continue watching": up to 6 cards, newest first. Each card has a 3px gold line along the bottom showing progress, and "بقي ١٢ دقيقة" / "12 min left".
- Home row 2 is "سلاسل بدأتها" / "Series you started": a card per playlist with "٤ من ٢٠ درسًا" / "4 of 20 lessons" and a progress line.
- Either row with no items is hidden, never shown empty.
- Account chip in the fixed chrome, next to the EN|AR toggle, 44px:
  - It shows a letter, not the Google photo (no network call, no tracking).
  - For a guest it reads "زائر" / "Guest", and its menu offers sign-in.
- First sign-in on a device that already has guest progress: ask once, "إضافة تقدّم الزائر إلى حسابك؟" with two buttons, "إضافة" / "Add" and "تجاهل" / "Skip". Merging keeps the furthest position for each video.
- Every account's progress is stored under that account's own ID, and guest progress is stored separately. Sign-out returns to the opening and clears whatever is in memory. The login token is never kept long-term, only the account ID and the initial letter.

## 2. Whole-project review

**Stays as is:** every established decision listed in the brief.

**Changes and exact values (all DESIGN):**
- **Type:**
  - Arabic body: Noto Sans Arabic 17px, line-height 1.8. English body: 16px, line-height 1.6.
  - Headings: Amiri Bold, 24px for H1 and 20px for H2.
  - Line length: at most 60 characters in Arabic and 68 in English.
- **Spacing:** 8px grid. Card radius 12px. Focus ring 2px in the focus token with a 2px offset, contrast at least 3:1 in every theme.
- **Numbers:** Arabic-Indic digits in Arabic mode (counts, durations, timestamps) and Western digits in English mode.
- **Mixed-language titles:** every title is marked `dir="auto"` so English words inside Arabic titles render in the right order.
- **Home / catalog:**
  - Thumbnail cards at 16:9, titles cut off at 2 lines.
  - 2 columns at 390px, `auto-fill minmax(220px)` on desktop.
  - Counts come from the reconciled catalog at build time and are never typed in by hand.
- **Playlist page:** header with title, lesson count and total length, then a numbered list. Each row shows watched, in-progress or new.
- **Lesson page and player:**
  - Source switcher is a segmented control: "YouTube | نسخة محفوظة | ملف محلي" / "YouTube | Saved copy | Local file".
  - It lists only the sources this lesson actually has.
  - Switching source keeps the current time.
  - The recitation stops when a lesson page opens and has no control on lesson pages.
- **Transcripts:**
  - Placement: under the player, with AR | EN tabs. The last tab chosen is remembered.
  - Current line: marked by a 2px gold line on its leading edge, never a gold fill. Tapping a line jumps the video to it.
  - Scrolling: follows the video smoothly, or instantly when reduced motion is on, and pauses for 5 seconds after the person scrolls by hand.
  - Search box inside the transcript.
- **Books:** hidden until the first approved book and file exist (already decided). Opens in the browser's own PDF reader.
- **About:** the same rule as Books. Hidden until the owner approves the text, and every fact needs a source. It covers the Sheikh only.
- **Settings:** six theme swatches, Calm, reduced motion, language, and the line "مسح بيانات المتصفح يحذف تقدّم الزائر" / "Clearing browser data deletes guest progress".
- **Calm** turns off all decorative motion, drops the pattern to 50% opacity and hides the recitation control.
- **Hero:** the flat-vector sunset takes its colors from theme tokens, so all six themes get a matching hero without extra image files.

## 3. Holes found and decided (all DESIGN)

| Gap | Decision |
|---|---|
| Local file missing | That source disappears from the switcher. If no source plays, show "هذا الدرس غير متاح على هذا الجهاز" / "This lesson isn't available on this device", plus a link to the next lesson. |
| Thumbnail missing | Pattern background in theme tokens with the title on it. Never a broken image. |
| Transcript missing in one language | That tab is disabled and reads "لا يتوفر نص بالإنجليزية لهذا الدرس" / "No English transcript for this lesson". |
| Playlist with 0 playable lessons | Left out of the catalog by item 1's reconciliation output. |
| Offline | No banner over the whole app. A notice appears only where an action needs the network (Google button, YouTube source, hosted copy). |
| Search finds nothing | "لا نتائج لـ «…»" / "No results for "…"", with a clear-search button. |
| Signed in but now offline | Stays signed in, saves locally, syncs when back online. The furthest position wins and the newest update breaks ties. Only applies if B1 is approved. |
| Several accounts on one device | Each account and the guest have separate storage. No screen shows another account's progress. |
| 390px | Fixed chrome is 56px tall with no horizontal scroll. Source switcher labels shorten to icon plus a short word below 360px. Every tap target is at least 44px. |
| Reduced motion | Verse appears without the fade, scrolling jumps, progress lines don't animate, the hero is still. |
| Six themes | Every theme pair must pass contrast: 4.5:1 for text, 3:1 for gold lines and focus rings. Any theme that fails is changed or removed before ship. |
| Recitation | Never plays on its own, and stops on any video play or lesson page. |
| Hosted copy (R2) | Public read-only bucket, or links signed on the server. No keys in the app. Confirm which one. |
| Phone delivery | A single local file isn't reliable on iOS Safari (storage, opening it at all). Owner decision on how the phone version is delivered. This is the same root problem as B1. |
| Local IDs | Generated with `crypto.randomUUID` only, never `Math.random`. |

## 4. Verification bar: zero errors before the owner sees anything

- **Codex (mechanical checks):**
  - Contrast script across all 6 themes.
  - Grep the UI strings for em dashes and draft words (TODO, lorem, coming soon, قريبًا, تجريبي, placeholder). Must return zero.
  - Secrets grep, plus a `Math.random` check.
  - Font license files are bundled.
  - Tap-target audit at 44px.
  - Network log while offline: zero requests besides the allowed sources.
  - Playwright screenshots of every screen: 6 themes × AR/EN × reduced motion on/off, at 390 and 1440 (48 shots per screen). Zero console errors and zero serious or critical accessibility (axe) findings.
- **Gemini and DeepSeek (independent review of the screenshots):** each reviews separately. DeepSeek sees screenshots only, never code or account data.
- **Mine (deep review and scholarly judgment):**
  - The verse matches the Uthmani Mushaf text exactly, character for character, diacritics included (check against the Tanzil source).
  - Amiri Quran renders correctly: ligatures and marks intact in every theme.
  - The Sheikh's name and honorific are spelled the same everywhere.
  - Every About fact traces to a source.
  - No other scholar is given prominence.
  - Arabic copy is correct (grammar, hamza, diacritics where needed), and the AR and EN versions say the same thing.
  - Spot-check transcript alignment on 10 lessons.
  - Confirm the reciter's credit and the CC0 license.
- **Parent (judge):** checks everything firsthand, including one real phone. That last check needs a person or a real device, because this VM can't do it.
- **Owner:** sees the result only after every check above passes, delivered with proof (screenshot set, test output, and where each check ran).

## Does the build need to pause?

**No.** Item 1 doesn't depend on design. Two notes for the builder, though:
- Item 1's catalog output should carry per-lesson availability fields: local file, hosted copy, YouTube ID, AR transcript, EN transcript, thumbnail. All the missing-file states above read from them.
- Item 15 must not start until the owner decides B1 (sign-in and sync), and B2 (YouTube from a local file) must be tested before the player is built.

**Risk:** if the owner turns down a sync store, item 15 changes from "add sign-in" to "cut sign-in".
