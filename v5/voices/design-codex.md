# Codex design consultation — V5 (Sheikh Moustafa Kamel library)

- Voice: Codex (design consultation only, NOT the builder)
- Date: 2026-11-21 (Nov 20, 2026 ~20:14 PST task)
- Method: `~/.claude-npm/bin/codex` v0.166.0, model gpt-6.2-sol, non-interactive `codex exec`, prompt via stdin, 22,849 tokens, session `01a1fc55-cd0e-7bc3-b2da-368102a6fbd1`
- Provenance note: the first Codex invocation passed the prompt as a CLI argument and hung waiting on stdin ("Reading additional input from stdin..."); it was killed (SIGTERM) and re-run with the prompt on stdin, which completed with exit 0. The first run's truncation was my own `head` pipe closing, not a Codex failure. Codex answered from the supplied context plus its own judgment; it did not re-read BRIEF_V5.md or the v4 source itself in the successful run. The mechanical checks in §5 below are mine, done firsthand against the files.
- Build decision (Codex): **No pause.** Item 1 catalog reconciliation can proceed. Apply these decisions when the affected V5 screens are built. Keep the seven held playlists out of the curriculum and publish Books and About content only when their respective approval gates are met.

## 1. Login

**Verdict: Lead with guest entry. Keep Gmail sign-in visible as the secondary action.** This lets people reach the library immediately and gives returning learners a clear route to synced progress.

| DESIGN element | Arabic | English |
|---|---|---|
| Library title | مكتبة الشيخ مصطفى كامل | Sheikh Moustafa Kamel Library |
| Verse | وَقُل رَّبِّ زِدْنِي عِلْمًا | And say, "My Lord, increase me in knowledge." |
| Citation | طه ٢٠:١١٤ | Taha 20:114 |
| Primary | الدخول كضيف | Enter as guest |
| Secondary | تسجيل الدخول باستخدام Gmail | Sign in with Gmail |
| Sign-in benefit | سجّل الدخول لمزامنة تقدّمك بين أجهزتك. | Sign in to sync your progress across devices. |
| Continue rail | تابع المشاهدة | Continue watching |
| Path resumption | تابع من حيث توقفت | Pick up where you left off |

**DESIGN layout.** Center a single column, capped at 440px, over the painted sunset. Place the library title, verse and citation, guest button, Gmail button, then the sign-in benefit in that order. Use 16px side gutters at 390px, 48px-high stacked pills, and a 12px gap between buttons. Use a solid theme accent for guest entry and a quiet outline for Gmail. Keep `EN | AR` in its established corner. Set the Arabic verse in Amiri Quran at 2.2 line-height. Keep the Arabic verse in both locales and add the English translation beneath it in English. Allow one 300ms fade with an 8px rise on the opening panel as a whole. Keep the verse itself static within the panel, and show everything immediately in Calm or reduced-motion mode.

**DESIGN after entry.** Put **Continue watching** first on Home when there is an unfinished video. Order by last watched, show a progress bar and a localized timestamp such as `Resume at 12:34` / `تابع من ١٢:٣٤`, and resume at the saved position. Show started classes and courses in the 40-day path with a completed-lesson count and one action to resume the next unfinished lesson. Hide empty progress rails. Use the same layout for guests and signed-in learners. Keep guest progress on the device and signed-in progress account-scoped. If guest progress exists at sign-in, offer an explicit import. If an imported lesson already has account progress, preserve completion and keep the more recently updated unfinished position.

## 2. Whole-project design review

**Verdict: Keep the Illuminated Page and the V4 information architecture. Fix the shared controls and mobile layout before signing off on any V5 screen.** The supplied context confirms the V4 findings below. The screen decisions are acceptance criteria, with rendered-screen verification still pending.

| Surface | Decision |
|---|---|
| Shared shell and navigation | **DESIGN:** Keep fixed Arabic RTL chrome, a stable `EN \| AR` corner and a five-item navigation cap. Apply `lang` and `dir` to text blocks. Keep emblem, pattern and media controls physically fixed across locale switches. Increase the verified 38px nav links, 32px segmented buttons and 36–38px small controls to at least **44 × 44px** actual hit areas. At **480px and below**, use a 44px menu trigger with a vertical list of 44px rows. |
| Opening and Home | **DESIGN:** Keep the painted flat-vector sunset and the 60/30/10 balance of dominant surfaces, secondary surfaces and accents. Use gold for 1px rules and outlines. Give the verse clear space. Place Continue first when populated, followed by the path and library entry points. Keep recitation off by default with an explicit play control and credit to Aaqib Azeez, CC0. Stop recitation whenever lesson playback starts. |
| Library, search and playlists | **DESIGN:** Use one column at 390px, 16px gutters and 12px card gaps. Keep titles readable at 16px minimum and allow Arabic titles to wrap. Give each card one primary action. Preserve search, filters and scroll position when returning from a lesson. |
| 40-day path, class and course views | **DESIGN:** Use a chronological list at 390px. Show progress as a localized text count and pair completion icons with text. Give each class or course one resume action. Hold the seven owner-review playlists out of the curriculum. |
| Lesson and dual playback | **DESIGN:** Put one 16:9 player on the lesson page. Use YouTube by default, with Hosted as the second choice and local media as fallback when present. Use 44px source controls, preserve the playback position where the source supports seeking, and stop the previous source before switching. Keep seek and transport direction fixed across locales. |
| Transcripts | **DESIGN:** Put full in-browser Arabic and English text below the player. Use 44px language controls and semantic text with the correct `lang` and `dir`. Use 16px body text minimum and 1.8 line-height. Remember the chosen language for that lesson. Keep playback uninterrupted when the transcript language changes. |
| Books and PDF reader | **DESIGN:** Reveal Books only after an approved title has a verified readable file. Use one card per approved work, with its volumes or parts grouped underneath. Show the Sheikh's PhD work as one title with four ordered parts once approved. Reconcile the 72 manifest rows against the 65 unique files before exposing records. Open approved PDFs in the native reader and preserve the Books list position on return. |
| About | **DESIGN:** Use one quiet editorial page centered on Sheikh Moustafa Kamel. Publish only owner-approved facts. Keep the route out of navigation until approved content exists. Fit Books and About into the existing five-item cap, using a secondary link for About if needed. |
| Guest, account and preferences | **DESIGN:** Keep the library and path available to guests. Put sign-in, account state and sign-out in the session control. Keep six themes and Calm in preferences with 44px targets. Use local Amiri Quran for the verse, Noto Sans Arabic for UI and body, Amiri Bold for headings, and one Kufi face for emblems. Theme tokens cover page, surface, text, borders, focus, controls and feedback. Use 200–400ms transform and opacity motion where enabled. |

## 3. Hole-hunting

**Verdict: Give every failure a recovery action where it occurs. Keep browsing available whenever the catalog is present.**

- **DESIGN · Offline and missing media.** Show a local file immediately when offline and available. Otherwise show `This lesson video needs an internet connection.` / `يتطلّب فيديو هذا الدرس اتصالًا بالإنترنت.` Keep any bundled transcript available. Online, offer Hosted if YouTube fails, then local if available. If all sources fail, retain the last confirmed timestamp and offer `Retry` / `إعادة المحاولة`. For a missing or unreadable approved PDF, keep the user in Books and identify the unavailable part.
- **DESIGN · Empty or partial content.** Hide empty Continue and started-course sections. Give zero search results one action, `Clear filters` / `مسح عوامل التصفية`, when filters are active, or `Clear search` / `مسح البحث` otherwise. If one transcript language is unavailable, keep the available language readable and label the unavailable choice. If both are missing, show one short status below the player. Offer recitation only when its asset is available.
- **DESIGN · Sign-in and sync.** On sign-in cancellation, restore focus to Gmail and keep guest entry ready. If sign-in fails or is offline, explain it inline and keep the guest primary action. For an established signed-in session, queue offline progress only in that account's namespace. On sign-out or session expiry, clear the visible account rail immediately and protect any queued progress until the same account returns. Never show another account's progress during account switching.
- **DESIGN · Loading, deep links and keyboard.** Preserve space for the player during loading. Keep Back usable through failures. For a missing or withheld lesson reached by deep link, offer one return-to-library action. Put focus on the destination heading after navigation and return focus to the invoking control after a menu closes. Keep keyboard focus visible and clear of fixed chrome.
- **DESIGN · 390px, motion and themes.** Check both locales at 390px and at 200% text zoom. Require zero horizontal page overflow, readable verse and title wrapping, and 44px targets. Either Calm or OS reduced motion disables the opening transition and decorative motion. Run the state matrix in **Parchment, Emerald, Midnight, Sand, Sunset and Pure dark**. Require at least **4.5:1** for normal text and **3:1** for large text, focus indicators and essential control boundaries. Check text over the sunset at the least favorable point behind each label.

## 4. Verification bar

**Verdict: Zero known release errors across the agreed checks before the owner sees a final result.** A failed check or an untested required state keeps final sign-off open.

| Voice | Owns |
|---|---|
| Builder | Implements the decisions and supplies a runnable build, the catalog reconciliation report, asset and playback results, and fixes for any acceptance failures. |
| **Codex, design consultation** | Owns the independent acceptance matrix and evidence review. Checks every route and listed state at desktop and 390px, both locales, all six themes, Calm and OS reduced motion, keyboard and zoom. Checks 44px hit areas, contrast, fixed chrome, scripture treatment, AR/EN copy and rendered strings for em dashes or draft language. Checks actual playback fallback, resume behavior, audio exclusivity, offline access, native PDF opening and transcript language behavior. Checks that the release evidence covers the catalog and content gates. |
| Security reviewer | Verifies frontend bundles and served configuration contain no secrets, token issuance uses a CSPRNG, and two distinct accounts cannot read or write one another's progress. Exercises sign-out, expired sessions, account switching and offline queue replay against real account boundaries. |
| Owner and Arabic editorial reviewer | Approve biography facts, public book editions and files, curriculum inclusions, Arabic wording and verse presentation. Record content approval before those surfaces become public. |

## 5. Mechanical checks (subagent, firsthand, against the files)

Checked 2026-11-21 against `~/workspace/archive-rebuild/v4/src/` and `~/workspace/archive-rebuild/v5/`:

| Check | Result | Evidence |
|---|---|---|
| Six themes present | PASS | `v4/src/app.css` has `data-theme="parchment|emerald|midnight|sand|sunset|puredark"` |
| Verse line-height >= 2.0 | PASS | `.sp-verse` line-height 2.2, `v4/src/app.css:565` |
| No em dash in v4 UI source | PASS | `grep — v4/src/app.js v4/src/body.html v4/src/content.json` returns only the comment "never an em dash" |
| 5 nav items | PASS | `nav_home, nav_library, nav_start, nav_saved, nav_about` only in `v4/src/app.js` |
| 44px minimum targets | FAIL (open) | `.btn` min-height 44px PASS, but `.nav a` 38px, `.seg button` 32px, `.btn.small` 36px, `.lacts .btn` 38px — all below 44px |
| 390px-specific layout | FAIL (open) | No 390px media query; smallest breakpoint is 600px (`app.css:753,781`). v4 TEST-RESULTS.md claims 390px nav/theme-picker visibility, but that is a screenshot claim, not a CSS rule |
| Fonts bundled | PASS | Amiri Quran, Amiri, Noto Sans Arabic, Reem Kufi referenced in `v4/src/app.css`; fonts dir under `v4/src/assets/fonts/` |
| Recitation asset present in v4 build | PASS | `recitation.mp3` in `v4/build/Preview/assets/` (not in `v4/src/assets/`, which holds only fonts/img) |
| Reduced-motion / Calm guard | PASS | `@media (prefers-reduced-motion:reduce)` at `app.css:793,806`; `html.calm` collapses durations to 0.01ms |
| Arabic pluralization (CLDR dual/few) | PASS in source | Comment + logic at `v4/src/app.js:739` (one/two/few categories) |
| Opening: verse alone + one Enter button | PASS | `v4/src/body.html:103,137` — one `sp-enter` button |
| v5/src state | INFO | `diff -rq v4/src v5/src` returns nothing: v5/src is still byte-identical to v4/src; build is on item 1 (catalog audit), `v5/audit/` is empty, `v5/build-v5.log` is empty at check time |
| Books on disk | INFO | `v5/books-from-sheikh/MANIFEST.json` is a list of 72 entries; 65 unique files per prior count; PhD book parts 1–4 + covers + PRINTER_SPECS.md present |

## 6. Flags for the council / coordinator (not Codex's words)

1. **About route vs v4 reality:** Codex §2 says "Keep the route out of navigation until approved content exists." V4 already ships an About hub (three tabs incl. the Sheikh tab) behind `nav_about`, and brief item 5 says "extend the existing About the Sheikh tab." Hiding the whole About route would regress v4. The council should rule: keep the About hub visible as in v4, publish only approved facts inside it, omit unapproved sections (the existing v4 rule), rather than hiding the route.
2. **Login order vs brief order:** Brief item 15 lists "sign in with Gmail, or enter as a guest" in that order, but Codex decides guest FIRST as primary. This matches playbook §2.14 ("never force account creation before the action") and the v4 opening's single-Enter pattern. The council should confirm the flip explicitly, since it reverses the brief's listed order.
3. **"Solid theme accent" guest button vs gold-as-line:** Codex's guest primary is a solid accent fill. That is consistent with the playbook CTA spec (pill, >=44px, one primary action) and with v4's `.sp-enter` (52px pill), but the builder must not render it as a gold fill; gold stays a line. Theme accent fill, not gold fill.
4. **Transcript language memory:** Codex adds "remember the chosen language for that lesson" — a new small behavior not in brief item 14; harmless, but the builder should confirm it is per-lesson, not a global override of the UI language.
5. **Codex's Books gate wording:** "Reconcile the 72 manifest rows against the 65 unique files before exposing records" — this is a dedup-rule application, not a design value; the manifest/file gap is duplicates (same file under variant names), already expected, not a defect to fix before listing approved books.
