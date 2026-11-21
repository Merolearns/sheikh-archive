# Design consultation - Gemini voice - V5

**Voice:** Gemini (consultation voice, not the builder)
**Date:** 2026-11-20
**Model:** gemini-3-flash-preview via `~/workspace/custom-connectors/custom.gemini/bin/gemini-chat`
**Call result:** succeeded on the first attempt (~12 s). No fallback model needed. No retry needed.
**Sources read before answering:** `BRIEF_V5.md` (15 items), `v5/verdict-20261120.md` (decisions 1-18), `vetted-playbook.md` §§2, 4, 8, and the five research reports (design-research, round2, round3, content-mapping, v4-improvements).
**Scope:** the council decides ALL design A to Z for the whole V5 project (owner order Nov 20, 2026 ~20:11 PST). Nothing ships with a hole or flaw.
**Note on this file:** the sections Q1-Q4 and the pause answer below are Gemini's answer, reproduced faithfully. The "Scribe flags" section at the end is not Gemini's words; it records where Gemini's answer conflicts with the brief or established design, for the council to adjudicate.

---

## Q1. LOGIN PAGE (brief item 15)

**Decision: Stacked vertical layout below the Illuminated Page verse.** Place the Google Sign-in button as the primary pill and "Continue as Guest" as a secondary text link. Show progress via a "Resume" section on the Home screen and a "My Progress" tab within the Saved section.

**Reasons:**
- DESIGN: Hierarchy. The verse وَقُل رَّبِّ زِدْنِي عِلْمًا is the crown of the page. Actions appear only after the 400ms fade+rise.
- DESIGN: Accessibility. Buttons use the 44px minimum height. Google Sign-in uses the official brand colors on a white/theme-surface pill.
- DESIGN: Copy.
  - AR: تسجيل الدخول عبر جوجل | المتابعة كزائر
  - EN: Sign in with Google | Continue as Guest
- DESIGN: Data Integrity. Upon first sign-in, a hairline-framed modal asks: "Merge local progress with your account?" (دمج التقدم المحلي مع حسابك؟). If yes, localStorage is pushed to the cloud; if no, cloud data overwrites local.
- DESIGN: State Management. Signed-in status is a subtle "Account" icon replacing the "Guest" label in Settings. Progress markers (percentage bars) appear on lesson cards only when data exists.

---

## Q2. WHOLE-PROJECT DESIGN REVIEW

**Decision: Retain v4 layout structures but enforce the "one numeral system per language" rule across all surfaces.** Update the dual player to use a "Source Toggle" icon (Server vs. Local) instead of text labels to save 390px space.

**Reasons:**
- DESIGN: Consistency. The Library and Playlist views must use Arabic numerals (٠١٢) in AR mode and Western numerals (012) in EN mode.
- DESIGN: Player States.
  - Local Playable: Green hairline indicator.
  - Local Missing: Grayed-out local toggle, default to R2/YouTube.
  - Neither: Quiet hairline error box stating "Lesson currently unavailable" (الدرس غير متوفر حاليا).
- DESIGN: Transcripts. Use a side-by-side view on desktop and a toggle-tab on 390px mobile. Font is Noto Sans Arabic at 1.2 line-height for readability.
- DESIGN: Books. The "الكتب" link in the Library header must match the 44px touch target height. PDF reader must use the theme's background color for the letterbox area to maintain the 60-30-10 balance.

---

## Q3. HOLE-HUNTING

**Decision: Implement "Ghost" states for missing files and a "Sync Conflict" resolver for account switching.** If a transcript or book file is missing, the button is hidden rather than shown as disabled.

**Reasons:**
- DESIGN: Empty States. Search with zero results displays: "No lessons found" (لم يتم العثور على دروس) with a suggestion to check spelling.
- DESIGN: Offline State. If the browser detects no connection and no local file, the play button transforms into a "Download needed" (يتطلب التحميل) icon.
- DESIGN: Error Handling. Sign-in failure triggers a bottom-toast with a quiet hairline frame. No celebratory or alarming icons.
- DESIGN: 40-Day Path. Completion triggers a unique Gold line border around the path card, no confetti, keeping with the "Restraint is premium" value.
- DESIGN: Theme Switching. Transition duration is 400ms using CSS custom properties (tokens) to prevent flash of unstyled content.

---

## Q4. VERIFICATION BAR

**Decision: A three-stage automated and manual sweep.** Codex performs the mechanical audit (numeral systems, em dash detection, RTL mirroring checks). Claude Code performs the "Spirit of Design" audit (calmness, text-over-decoration). The Owner-Hardware Matrix must be signed off on physical devices.

**Reasons:**
- DESIGN: Mechanical Sweep. Ensure no em dashes exist in any AR/EN JSON translation files. Check all 44px targets on 390px viewport.
- DESIGN: Hardware Matrix. Test on: 1. iPhone 13 (390px), 2. Low-end Android (Reduced motion), 3. iPad (RTL fixed chrome check), 4. Desktop Chrome (R2/YouTube toggle).
- DESIGN: Voice Roles. Codex enforces the "one numeral system" and "gold is a line" rules. Claude Code ensures the "Illuminated Page" choreography does not regress during login transitions.

---

## DOES THE V5 BUILD NEED TO PAUSE?

**No.** The current catalog reconciliation is a data-layer task. These design decisions govern the presentation layer (UI). Since the "ESTABLISHED DESIGN" remains the foundation, the build can proceed with data mapping while these UI refinements are applied to the frontend components.

---

## Scribe flags (not Gemini's words)

Recorded for the council to adjudicate; Gemini's decisions above stand as written until the council rules otherwise.

1. **Merge "no" must not overwrite local progress.** Gemini's Q1 says if the user declines the merge, "cloud data overwrites local." That contradicts brief item 15: signing in must never wipe or overwrite local progress, and local progress is offered for merge, never silently discarded. The brief-compliant behavior is: declining keeps local progress local-only and untouched; the account's cloud progress stays separate until the user chooses to merge. Council must rule this one way or the other; the brief as written forbids Gemini's version.
2. **Icon-only "Source Toggle" contradicts the text-labels rule.** Gemini's Q2 replaces the dual-playback text labels with a "Server vs. Local" icon toggle. The verdict's adopted rule (Qwen, decision 4) is text labels mandatory, no icon-only YouTube links. "Server" is also technical jargon, which the round-3 simplicity rule forbids in UI copy. If space is the concern at 390px, the council should decide a shortened text label, not an icon-only control.
3. **Transcript line-height 1.2 contradicts the research.** Gemini's Q2 sets transcripts at Noto Sans Arabic 1.2 line-height. The research requires Arabic body/UI at 1.7-1.8 and verse at 2.0 or more; 1.2 clips tashkeel. Transcripts carry quoted Qur'an and must inherit the verse/body leading, not Latin leading.
4. **"Download needed" on offline detection contradicts the no-onLine-gating rule.** Gemini's Q3 transforms the play button based on detected connection. The verdict forbids `navigator.onLine` gating, and there is no download feature in V5, so a "Download needed" control promises an action that does not exist. The decided state machine already covers the missing-file case without connection detection.
5. **Guest entry as a text link needs a 44px target.** Gemini's Q1 makes "Continue as Guest" a secondary text link. A text link still needs the 44px minimum touch target, and the playbook §2.14 lesson ("never force account creation before the action") argues against making sign-in the only pill while guest entry is visually demoted. The council should weigh two equal pills versus primary/secondary.
6. **"My Progress" tab inside Saved is a new surface.** Gemini's Q1 puts progress in a tab within Saved. Saved is video-only by decision, and a progress tab changes its scope. The brief's progress display is the Continue rail (filtered to the account) plus per-series started/completion state. If a dedicated progress surface is wanted, it needs a council decision and a home for it that is not Saved.
7. **Search zero-results copy is too generic.** Gemini's Q3 "No lessons found" repeats the v4 contradiction the audit flagged: the panel must say whether it means no matching series, no matching lessons, or both, and the lesson-count notice stays visually primary. The audit's fix (decision 7) governs here.
8. **Agreements worth keeping:** hiding (not disabling) buttons for missing transcripts/books matches the v4 rule "never offer what does not exist"; sign-in failure as a quiet hairline-framed toast matches the error treatment; the 40-day completion as a gold line only (no confetti) matches the established completion language; theme switching at 400ms sits inside the 200-400ms band.
