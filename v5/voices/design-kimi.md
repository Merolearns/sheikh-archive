# KIMI voice: V5 design consultation

- Voice: Kimi (long-context review)
- Model: kimi-k2.7-code, temperature exactly 1
- Date: 2026-11-20 (PST)
- Role: consultation voice only. Nothing in this file is a build instruction to itself; the builder follows the council design verdict (`v5/verdict-design-20261120.md`).
- Method: the coordinator read BRIEF_V5.md, `v5/verdict-20261120.md`, vetted-playbook §§2, 4, 8, all five design research reports, and the v4 source end to end (body.html, app.css, app.js structure plus key sections, DECISIONS.md), then put the questions to Kimi in three compact calls. Call history, recorded honestly: the first full-prompt call (max-tokens 8000) returned empty content with finish_reason length, the reasoning model having spent all 8000 tokens on reasoning; a second call at max-tokens 24000 timed out at the helper's 120-second HTTP timeout; the consultation was then split into three compact calls (Q1; Q2; Q3+Q4), each max-tokens 8000, and all three returned content. No opinion below was invented by the coordinator; the three Kimi replies are reproduced in full, in order.
- Standing note: the native-Arabic copy audit (brief item 8) has final say on all wording proposed here.
- Pause flag (from the Q1 call, see §1): no pause for item 1 catalog reconciliation; hard stop before any Google Sign-In engineering (it needs a Google Cloud project / OAuth client, forbidden without the owner's word).

---

## 1. LOGIN PAGE (brief item 15)

**Pause flag**

DESIGN: No pause for the current item 1 catalog-reconciliation work; it is not design-dependent.
DESIGN: Hard stop before any Google Sign-In engineering starts: it requires a Google Cloud project / OAuth client / account, and the brief forbids creating or paying for any cloud account without owner word.

### V5 opening login decisions

**Layout on the Illuminated Page**

DESIGN: Keep the existing splash structure: painted flat-vector sunset hero, mihrab arch gold line-work draws once, verse fades+rise once, citation, then Sheikh name.
DESIGN: Add the action stack below the Sheikh name, centered, in the lower-third safe zone; never cover the verse.
DESIGN: Order top-to-bottom: primary Enter pill, then Google sign-in pill, then optional helper subline.
DESIGN: Spacing token: 32 px between Sheikh name and first button; 20 px between buttons; 24 px horizontal margin on 390 px mobile.
DESIGN: Both buttons are pills, height 52 px, tap target ≥ 44 px, full-width on mobile, auto-width capped on desktop.

**Buttons and wording**

DESIGN: One primary action only: **Enter the Library** / **ادخل المكتبة**.
DESIGN: Primary is the guest path; subline reads **Progress stays on this device** / **يبقى التقدّم على هذا الجهاز**.
DESIGN: Secondary Google pill label: **Sign in with Google** / **تسجيل الدخول عبر Google**.
DESIGN: Google pill subline: **Sync progress across devices** / **زامن تقدّمك بين الأجهزة**.
DESIGN: Static SVG Google "G" icon only; no external request for the icon.
DESIGN: No em dash in any copy.

**Tap feedback**

DESIGN: Guest Enter tap: immediate route to the library final frame; no delay.
DESIGN: Google tap: button presses to `scale(0.98)` + opacity `0.9` over 200 ms, then hands off to the system/account chooser.
DESIGN: During the external handoff, disable the button and show inline **Signing in…** / **جاري تسجيل الدخول…**.
DESIGN: Reduced-motion mode: skip the scale, keep opacity-only feedback.

**Returning signed-in user on the opening**

DESIGN: If a valid signed-in session exists, hide the Google option and show only the Enter pill.
DESIGN: Show one welcome line under the Sheikh name: **Welcome back, [First name]** / **أهلاً بك، [الاسم]**.
DESIGN: Do not show progress counts, rail, or video titles on the opening; keep the page sacred and minimal.
DESIGN: Full progress display appears only after entry, on Home.

**Merge offer on first sign-in**

DESIGN: Triggered immediately after Google returns a new account and local progress exists.
DESIGN: Modal card in the Illuminated Page language: sunset tint, gold 1 px border, 44 px targets.
DESIGN: Title: **Keep your progress?** / **احتفظ بتقدّمك؟**
DESIGN: Body: **This device has saved progress. Merge it with your account, keep only your account progress, or stay as a guest.** / **هذا الجهاز يحتوي على تقدّم محفوظ. اختر دمجه مع حسابك، أو الاحتفاظ بتقدّم الحساب فقط، أو البقاء ضيفاً.**
DESIGN: Choices, in order:
1. Primary default pill: **Merge with my account** / **دمجه مع حسابي**
2. Secondary pill: **Keep account progress only** / **الاحتفاظ بتقدّم الحساب فقط**
3. Text tertiary: **Stay as guest** / **البقاء ضيفاً**
DESIGN: Default is **Merge with my account**; never silently discard local progress.

**Signed-in identity in the header after entry**

DESIGN: Keep the 68 px sticky fixed chrome; brand anchored at the RTL right (LTR left).
DESIGN: Account chip sits at the opposing chrome end from the brand, grouped with theme and language toggle.
DESIGN: Show a 36 px circular avatar + first name on desktop; on 390 px mobile show avatar only.
DESIGN: Tap opens a small menu: **Account** / **حسابي** and **Sign out** / **تسجيل الخروج**.
DESIGN: No account email displayed; first name only for privacy and compactness.

**Guest state indicator inside the library**

DESIGN: In the same header corner, show a guest chip: silhouette avatar + **Guest** / **ضيف**.
DESIGN: On 390 px mobile, collapse to the avatar icon with `aria-label="Guest"`.
DESIGN: Tap opens a menu with one action: **Sign in to save progress** / **سجّل الدخول لحفظ تقدّمك**.

**Progress display after entry**

DESIGN: Home loads the Continue rail filtered to the signed-in account.
DESIGN: Per-video resume position and watched state come from the account.
DESIGN: Series and course cards show a progress ring plus label **Continue** / **استمرّ** or **Start** / **ابدأ**.
DESIGN: Guest users keep the exact V4 local-only behavior: local progress, local Continue rail, no sync.

**Implementation notes**

DESIGN: All progress merge logic must happen server-side or in a trusted context; no secrets in the frontend, CSPRNG-only tokens, per-account access rules per Playbook §4.
DESIGN: Native-Arabic copy audit has final say on all Arabic strings above.

---

## 2. WHOLE-PROJECT DESIGN REVIEW

DESIGN V5 council review: all v4 surfaces stay structurally intact. V5 additions inherit the established tokens, 60-30-10 restraint, gold as line, breath motion, fixed chrome, RTL anchor, and 390px rules. No sixth nav item. No em dash in any UI copy.

### V4 screen audit

- Header sticky 68px: keep. Add 36px account chip (avatar + first name desktop, avatar only at 390px). Add Books as a quiet secondary link, not nav.
- Home hero: keep. Post-entry only: account-filtered Continue rail and progress rings on series cards. Guest sees universal rail.
- Library: keep. Add one calm dismissible missing-videos banner. Add "الكتب" quiet link beside the Library title.
- Lesson page: change for dual playback. Keep gold hairline frame, corner stars, 16:9 stage, captions overlay, 8-star buffering.
- Playlist/series: keep.
- Where to Start: keep. Books excluded entirely.
- About hub: keep 3-tab structure. Add verified facts and Books link only after data exists.
- Saved: keep video-only. Books do not appear here.
- Search: keep. Add book titles/metadata as a grouped result type. No mixed result cards.
- Footer: keep.
- Error state: keep pattern. Extend to playback failures below.

### V5 surfaces

#### (a) Dual playback

DESIGN: One primary action only. YouTube in-page is the default on first click. R2 and local are secondary sources inside a quiet disclosure. Activation of YouTube pauses local playback, saves local position, and stops recitation.

**Action area layout and order**

Desktop (≥744px), one row:
- EN LTR: [Star Save] [Primary Play/Resume] [Mark as watched] [Resume from] [Other sources]
- AR RTL: [حفظ النجمة] [شغّل/استأنف] [علّم كمشاهدة] [استئناف من] [مصادر أخرى]

390px (stacked):
- Primary pill full width.
- Compact row: Save star, Mark as watched, Resume from.
- Full-width disclosure: "Other sources" / "مصادر أخرى".

**Exact labels:**
- Primary fresh: "Play lesson" / "شغّل الدرس"
- Primary with progress: "Resume" / "استأنف"
- Mark watched: "Mark as watched" / "علّم كمشاهدة"
- Resume from: "Resume from 0:00" / "استئناف من 0:00"
- Sources disclosure: "Other sources" / "مصادر أخرى"
- R2 option: "Play from archive" / "شغّل من الأرشيف"
- Local option: "Open local file" / "افتح الملف المحلّي"
- Active source indicator: "YouTube" / "يوتيوب" as a quiet badge

**Playback states and notice wording**

State 1, local playable. No notice. Local loads if the user chooses it. Primary remains YouTube unless no YouTube ID exists.

State 2, confirmed missing local file. Notice: "This file is not on this device." / "الملف غير موجود على هذا الجهاز." Action: primary switches to YouTube if ID exists; otherwise R2; otherwise State 4.

State 3, file found but playback fails. Notice: "This file will not play on this device." / "لا يعمل هذا الملف على هذا الجهاز." Action: primary YouTube or R2; quiet "Retry local file" / "أعد محاولة الملف المحلّي".

State 4, neither local file nor resolvable video ID. Notice: "No playable source for this lesson." / "لا يوجد مصدر تشغيل لهذا الدرس." Actions: quiet "Notify the team" / "أبلغ الفريق"; quiet "Browse related lessons" / "تصفّح الدروس ذات الصلة".
DESIGN: Hide the video element in this state. Show the 64px khatam + human notice + closed Details disclosure, same as v4 error pattern.

#### (b) Books

DESIGN: Hidden globally until at least one approved book has a readable file. No 6th nav item. Reuse the series-card grid pattern for list. No Save on books.

List view:
- Cover image or 68px khatam emblem placeholder.
- Arabic title (primary, Amiri Bold).
- English title if supplied (secondary, Noto Sans Arabic, one line).
- Language badge.
- Page count.
- Grid: 4 columns desktop, 2 columns tablet, 1 column 390px.
- Sort: owner order first, then Arabic title.
- Filter: language only.

Detail view:
- Larger cover or khatem emblem (180px desktop, full width 390px).
- Metadata: language, page count, verified author/year only.
- Description.
- Primary pill: "Read" / "اقرأ".
- Fallback: "Open file" / "افتح الملف".
- Preview flavor: metadata only; notice "Available in the installed app" / "متاح في التطبيق المُثبَّت".

Reader:
- Native PDF reader inline.
- Failure fallback: "Open file" / "افتح الملف".
- Close control 44px. Full-screen on 390px.

Global search:
- Index book titles and metadata only.
- Results grouped: lessons first, books second, with clear section labels.

Saved:
- Video-only. Books excluded.

Where to Start:
- Books excluded.

#### (c) About additions

DESIGN: Facts only. Unknowns omitted, never filled. "Dr." used only if verified by reconciled data.

Additions:
- Books link placed as a quiet secondary link under the archive stats row, only after the Books list is populated.
- Stats remain computable from reconciled data only, with units.
- No progress rings or account progress on About. Progress belongs on Home and Library.

#### (d) Transcripts

DESIGN: Full AR+EN text in-browser in both local and YouTube modes. Golden Thread 2px gold bar retained.

- AR/EN tabs stay.
- Local mode: tap a line to seek the local player.
- YouTube mode: line sync to player time when available; tap a line to seek.
- Sync unavailable fallback: full text manual scroll; disable tap-to-seek; show quiet notice "Transcript is available for reading only." / "النص متاح للقراءة فقط."

### Theme, motion, and 390px

DESIGN: Every new surface uses the same theme tokens and motion vocabulary.

- 60-30-10 applies to Books and playback chrome.
- Gold remains a 1px hairline, never a fill.
- Covers sit inside the gold hairline frame; do not bleed palette.
- Motion: 200-400ms transform+opacity only, same cubic-bezier. Books list enters with section timing 250-300ms. Player source disclosure opens 250ms.
- Calm and reduced-motion collapse source disclosure to final frame and suppress list enter.
- 390px:
  - Account chip: avatar only, 36px.
  - Player actions stack vertically.
  - Books list: 1 column.
  - Book detail: cover full width above metadata.
  - Source disclosure: full width.
  - PDF reader: full screen, 44px close.

### Numeral and plural consistency

DESIGN: Use Arabic numerals (0-9) across both EN and AR UI. Plural forms must match the counted noun.

EN examples:
- "1 lesson", "2 lessons", "40 days", "1 book", "2 books", "1 page", "20 pages"
- Duration: "0:00" format only.

AR examples (native-Arabic copy final):
- "درس واحد", "درسان", "3 دروس"
- "كتاب واحد", "كتابان", "5 كتب"
- "صفحة واحدة", "صفحتان", "10 صفحات"
- "يوم واحد", "يومان", "40 يومًا"
- Duration: "0:00" format, no spelled-out numbers.

### Final decisions (§2)

- YouTube in-page is the sole primary action on click.
- R2 and local are always inside "Other sources" / "مصادر أخرى".
- Books never enter the nav or Saved.
- About uses verified data only; Books link appears only after populated.
- Transcripts stay dual-language with sync where possible, manual scroll fallback.
- All new surfaces pass the same token, motion, 390px, and numeral rules.

---

## 3. HOLE-HUNTING DECISIONS

DESIGN: the council rules below are final.

### Authentication and progress

- Sign-in failure: inline quiet notice under the Google pill, "Could not sign in. Try again." The Enter pill stays primary and usable. DESIGN: failure is nonblocking.
- Google chooser cancelled: no notice. The user remains in the login state. DESIGN: cancellation is silent and neutral.
- Account with zero progress: hide the Continue rail entirely; surface one primary pill, "Start the first lesson." DESIGN: zero progress shows a curated first step, never an empty rail.
- Account switch: sign out then sign in as a new account. Do not auto-merge progress from the previous account. Offer the merge modal only for local guest progress into the current account. DESIGN: account switch resets the session boundary.
- Sign-out mid-video: stop playback immediately. For YouTube mode, destroy the iframe. For local mode, pause. Show one inline notice, "Signed out. Progress stays on this device." DESIGN: sign-out is a hard stop with a single quiet notice.
- Merge declined: keep local progress on the device only; the account progress wins. Provide one undo control in Settings for 24 hours. DESIGN: decline is a clean fork with a narrow undo window.
- Merge conflict, local watch position ahead of account: default Merge keeps the greater of the two durations. Show the conflict row with local and account times plus a visible "Keep account" option. DESIGN: merge conflict resolves to maximum progress by default.

### Player sources

- YouTube embed blocked: if local or R2 exists, switch to it automatically. If not, show "YouTube is blocked right now. Try a local copy or check your connection." with Retry. DESIGN: blocked YouTube falls back to offline sources.
- YouTube video removed: show "This YouTube lesson is no longer available." Then check local and R2 silently. DESIGN: removed content triggers source-missing notice and offline fallback.
- No network in YouTube mode: same as blocked. Fallback to local or R2 if present. DESIGN: no network auto-falls back to offline sources.
- Hosted R2 copy unreachable: mark R2 as unavailable inside the "Other sources" disclosure. Play local if present. If neither source works, show the no-playable-source state. DESIGN: R2 failure is contained inside the disclosure.
- Local file appears after YouTube started: do not auto-switch. Show a quiet chip, "Local copy now available. Switch." DESIGN: late local copy is a user-initiated switch, never an interruption.

### Books

- Book file missing after listing: a listed book must already have a verified readable file. If the file later disappears, hide the card from the grid; a cached detail page shows "This book is not on this device." DESIGN: missing files remove the listing.
- Book with no cover: use a token-colored tile with a Reem Kufi emblem initial. No gray placeholder. DESIGN: missing cover uses themed emblem art.
- Book with no English title: render the Arabic title in both EN and AR modes. No "(Untitled)". DESIGN: Arabic-only titles display in Arabic across languages.
- About with no verified bio facts: hide the About link and route completely. DESIGN: About is inaccessible until at least one verified fact exists.
- Search across books vs videos: one search field returns grouped results, Videos then Books. Books appear only after approval. DESIGN: unified search with grouped output and book gating.

### 390px surfaces

- Login options: single-column stack, 16px margins, 48px pills full width within safe area. Enter primary. Google secondary. Toggle top right. DESIGN: login at 390px is a stacked 48px pill column.
- Player action area: primary "Watch on YouTube" pill full width. "Other sources" accordion below. State notices stack to two lines max. DESIGN: player action at 390px uses one full-width primary action.
- Books grid: single column, 100% width cards, 16px gutters, 2:3 cover ratio. DESIGN: Books grid at 390px is one column with token gutters.
- Progress display: progress rings shrink to 32px. Continue rail becomes horizontal scroll. Header shows avatar only, no first name. DESIGN: progress at 390px uses compact rings and scroll rail.

### Motion, themes, Calm, hosted flavor

- Reduced-motion and Calm on login page: respect system preference. The sacred verse fade+rise becomes an opacity-only transition or instant. No decorative motion elsewhere. DESIGN: login motion is minimal and sacred-text-only.
- Reduced-motion and Calm for the in-page YouTube player: the iframe content is external and exempt. The player container entry uses transform+opacity only, 200-400ms, and is suppressed under reduced-motion. Progress ring pulse is suppressed under Calm. DESIGN: container motion is controlled; iframe content is not.
- Six themes on every new surface: apply emerald, parchment, midnight, sand, sunset, puredark tokens to login, player, Books, About, search, and settings. On sunset and puredark, place the Google button inside a themed container that guarantees 4.5:1 contrast. YouTube iframe chrome cannot be themed; the surrounding page uses tokens. DESIGN: every surface is token-complete; Google button contrast is enforced by its container.
- Hosted flavor opening: use the same Illuminated Page and login page as offline. Guest mode behaves identically. The only difference is that network sources are physically available, but the app still requests nothing until the user explicitly chooses YouTube or "Other sources." DESIGN: hosted and offline share one opening; guest mode is source-neutral.

---

## 4. VERIFICATION BAR

DESIGN: the zero-error standard means no console errors, no broken Arabic shaping, no placeholder strings, no em dashes in UI copy, no layout breakage at 390px, no unintended network requests, no accessibility failures, and no silent progress loss.

### Voice assignments

- Codex: mechanical and consistency sweeps, guard checks, terminal work. Codex runs the state machine tables, token coverage grids, 390px breakpoint matrix, no-placeholder scan, no-em-dash scan, and the network guard diff.
- Claude Code: deep review and scholarly judgment. Claude Code signs off on About omission rules, transcript accuracy, merge conflict ethics, and Quran/religious copy appropriateness.
- Kimi: long-context review. Kimi verifies cross-surface consistency, theme coverage across all six palettes, the full user journey from login through player to Books, and alignment with the established illuminated-page system.
- Qwen: Arabic-first checks. Qwen owns Arabic copy sign-off, RTL fixed chrome, font loading for Amiri Quran / Noto Sans Arabic / Amiri Bold / Reem Kufi, text shaping, and mixed Arabic-English search behavior.
- DeepSeek: independent diagnosis. DeepSeek stress-tests the player state machine, sign-in failure paths, account switch boundaries, and the CSPRNG token / no-secrets-in-frontend rule.
- Gemini: checker voice. Gemini performs the final cross-check that every other voice's report is complete, coherent, and owner-ready.

### Exact checklist

Login page:
- Taha 20:114 renders with line-height 2.2; only one fade+rise animation, reduced-motion instant.
- Enter pill is primary, 48px, subline "Progress stays on this device."
- Google pill is secondary, 48px, subline "Sync progress across devices."
- Returning signed-in user sees welcome line only; no progress on opening.
- Sign-in failure shows inline notice; the page stays usable.
- Google chooser cancellation is silent.
- All six themes render; Google button has 4.5:1 contrast on sunset and puredark.
- 390px stack is single column with safe margins.
- Calm and reduced-motion remove decorative motion.

Player state machine:
- Local playable: no notice, plays.
- Confirmed missing: "This file is not on this device."
- Playback failure: "This file will not play on this device" plus Retry local.
- Neither file nor ID: "No playable source for this lesson," video hidden, 64px khatam, notice, closed Details.
- YouTube blocked / removed / no network: fallback path and correct notice.
- Sign-out mid-video stops playback.
- Late local file shows the switch chip.
- All motion is transform+opacity, 200-400ms only.

Books gating:
- Books hidden until approved book plus readable file.
- Series-card grid pattern.
- Native PDF reader with Open-file fallback.
- Preview metadata only.
- Search indexes titles and metadata only.
- Saved video-only.
- Missing file after listing handled.
- No cover and no English title handled.
- 390px single-column grid.

About omission rules:
- Verified facts only.
- Unknowns omitted.
- Books link appears only after populated.
- Section hidden if no verified facts exist.

Themes:
- All six tokens applied to every surface.
- Gold remains a line, never a fill.
- 60-30-10 restraint maintained.
- Sunset and puredark Google button contrast verified.
- YouTube iframe is unthemeable; surrounding chrome uses tokens.

Motion:
- Transform+opacity only.
- 200-400ms.
- Calm and reduced-motion toggle respected.
- Sacred text fade+rise only; reduced-motion opacity-only or instant.
- Login page has no decorative motion beyond the verse.

390px:
- Login options stack.
- Player action uses full-width primary pill.
- Books grid is single column.
- Progress rings are 32px with horizontal scroll.
- Header shows avatar only.

Arabic copy sign-off:
- Qwen approves every Arabic string.
- No placeholders.
- Amiri Quran for Quran text, Noto Sans Arabic for UI, Amiri Bold for headings, Reem Kufi for emblems only.
- RTL fixed chrome anchored.
- EN|AR toggle stays in the same corner.

Network guard re-scope, item 13 changes item 9:
- Default state is zero external requests.
- YouTube iframe loads only inside explicit YouTube-playback mode.
- R2 loads only inside the user-opened "Other sources" disclosure.
- Google Sign-In is an explicit user-initiated exception.
- No analytics, no CDN fonts, no hidden pings, no secrets in frontend, CSPRNG-only tokens, per-account access rules enforced.

DESIGN: nothing reaches the owner until all six voices submit signed reports and Gemini confirms the checklist is complete.

---

## Coordinator flags on this file (NOT Kimi's words; for the verdict to adjudicate)

1. Numerals: §2 says "Use Arabic numerals (0-9) across both EN and AR UI" and its AR examples use Latin digits ("3 دروس", "40 يومًا"). That contradicts v4 DECISIONS.md action 10, Arabic-Indic digits throughout the Arabic UI, durations included, which the v4-improvements report verified as built. The verdict should decide: keep Arabic-Indic in Arabic UI (v4 rule) or adopt Kimi's Latin-digit rule. Kimi's plural forms themselves (درسان / 3 دروس / كتابان / 5 كتب) are consistent with the v4 `Intl.PluralRules` helper.
2. State 4 action "Notify the team": no such feedback channel exists in the v4 app (no contact/corrections route in the UI). The verdict should either drop that action or define the channel; it cannot ship as a dead button.
3. "About with no verified bio facts: hide the About link and route completely" (§3) overreaches: the v4 About hub has three tabs (About the archive, Mission, The Sheikh). Hiding the whole hub because the Sheikh tab has no verified facts would also hide the About and Mission tabs, which do not depend on bio facts. The verdict should scope the hide to the Sheikh tab only (or to the bio block), not the whole hub.
4. "Provide one undo control in Settings for 24 hours" (§3, merge declined): v4 has no Settings surface (the Calm toggle lives in the theme picker). The verdict should name where that undo control lives, or drop the 24-hour undo in favor of re-offering merge on next sign-in.
5. §1 puts the guest Enter pill first and Google second; brief item 15 lists "sign in with Gmail, or enter as a guest" in the opposite order. Kimi's order follows playbook §2.14 (never force account creation before the action); the verdict should confirm the order explicitly rather than letting it stay implicit.
6. §2's "Resume from 0:00" label and §3's "Watch on YouTube" primary at 390px use the brief's agreed YouTube wording ("مشاهدة على يوتيوب" / "Watch on YouTube") only in the 390px line; the desktop primary is "Play lesson" / "شغّل الدرس". The verdict should confirm one primary label per state so the 390px and desktop labels do not diverge.
