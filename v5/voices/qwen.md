# QWEN voice - V5 consultation

- Voice: Qwen (Arabic-first reviewer)
- Model: qwen3.8-flash, via `~/workspace/custom-connectors/custom.qwen/bin/qwen-chat`
- Call: 2026-11-20 ~15:15 PST. Tokens: 1,209 in / 2,513 out. Usage logged to `usage-log.tsv` in the connector directory. No PAUSED file present; spend guardrail ($25 notify / $50 pause) not triggered.
- Method: the full consultation question (grounding facts, three decided requirements, open part, hard constraints) was sent to Qwen in one call. Everything in sections (1) to (6) below is Qwen's answer, transcribed. The only edits are formatting and one disclosed character removal (see the voice-agent note at the end).
- Grounding applied by the voice agent before the call: vetted playbook (including §8 DO NOT, none of which this plan touches), BRIEF_V4, v4 DECISIONS.md and TEST-RESULTS.md, the v4-improvements, content-mapping, round-2, round-3 and design research reports, and the v4 preview file.

---

## (1) Requirement 1 design: dual playback and YouTube link-out

**Placement:** The "Watch on YouTube" action must be distinct from local playback to avoid confusion about offline status. It should be placed in the **Video Player Header** (top right, next to the video title/close button) and optionally as a secondary icon in the **Series/Playlist Detail View** next to each lesson card.

**Behavior logic:**

- **Local file present:** The app plays the local file automatically. The "YouTube" link is available but labeled clearly as an external source.
- **Local file missing:** The player area displays a "File Not Found" state with two prominent buttons: "Try Local Again" (refreshes path check) and "Watch on YouTube".
- **Honesty constraint:** The UI must never imply the YouTube link is part of the offline bundle. It is a user-initiated escape hatch. No pre-fetching or background loading of YouTube metadata.

**UI copy (Arabic and English):**

| Context | Arabic | English | Notes |
|---|---|---|---|
| Button label (header) | شاهد على يوتيوب | Watch on YouTube | Primary CTA when local fails or as option. |
| Tooltip / subtext | رابط خارجي، يتطلب اتصالاً بالإنترنت | External link, requires internet | Critical for offline-first expectation management. |
| Missing file message | الملف المحلي غير موجود في هذا الجهاز | Local file not found on this device | Clear, non-technical error. |
| Fallback action | افتح المصدر الأصلي | Open original source | Neutral phrasing for the link-out. |
| Success state (local) | تشغيل محلي | Playing locally | Badge shown when local playback starts. |

**Implementation details:**

1. **Extraction:** Parse `VIDEO_ID` from catalog media paths (e.g. `[aoAR2A0pd9M]`) at runtime or pre-process into a dedicated field `yt_id` in the JSON data to avoid regex overhead during rendering.
2. **Link construction:** `https://www.youtube.com/watch?v=${videoId}`.
3. **Security/privacy:** Use `rel="noopener noreferrer"` on all anchor tags. Do not track clicks.

---

## (2) Requirement 2 design: Books section

**Section layout:** Add a new top-level navigation item: **"المكتبة"** (Library) or **"كتب الشيخ"** (Sheikh's Books). This distinguishes it from the video-centric main experience.

**List view:**

- Grid or list layout depending on cover art availability.
- Each card shows: title, author (fixed as Sheikh Moustafa Kamel unless specified otherwise), year (if known), and status badge ("Available Offline" vs "Source Only").

**Detail / reading experience:**

- **PDF viewer:** Embed a lightweight PDF.js viewer (bundled locally) for PDF files.
- **Text/HTML:** For non-PDF formats, render clean HTML with RTL support.
- **Metadata panel:** Side panel showing table of contents (if provided), description, and download link for the raw file.

**Offline file handling:**

- Files must be stored in a `/books/` directory within the app package.
- Large PDFs (>50MB) should be flagged; consider offering them as separate downloads outside the core app bundle if size constraints are critical, but ideally keep everything inside the single-file/offline structure if possible.

**Exact owner inputs needed before building:**

1. **File list:** A manifest mapping book titles to file names (e.g. `book_01.pdf`).
2. **Metadata CSV/JSON:**
   - `title_ar`, `title_en` (optional)
   - `author` (default: Sheikh Moustafa Kamel)
   - `year_published`
   - `description_ar` (short blurb)
   - `file_type` (pdf, epub, html)
   - `is_complete` (boolean, for partial scans)
3. **Cover images:** High-res JPG/PNG for each book. If none exist, use a generic placeholder design.
4. **Licensing info:** Confirmation that these books can be distributed offline (public domain, author permission, etc.). Note: we do not invent licensing.

---

## (3) Requirement 3 design: About the Sheikh page

**Structure:** A dedicated page accessible from the footer and main menu. Sections:

1. **Introduction:** Who he is (scholar, preacher, educator).
2. **Education and teachers:** Verified list only.
3. **Methodology:** Brief overview of his approach (Quranic focus, practical Sunnah).
4. **Contact/sources:** Links to official social media or websites (if verified).

**Verification standard:**

- **Allowed:** Facts sourced from his own published works, official biographies, or reputable Islamic news outlets.
- **Forbidden:** Unverified rumors, third-party blog posts without citations, AI-generated summaries.
- **Unknowns:** If a teacher's name is disputed or unconfirmed, omit it entirely. Do not write "studied under many scholars." Be specific or silent.

**Owner inputs needed:**

1. **Verified bio text:** A paragraph in Arabic confirming his birth year, place, and major teachers.
2. **Teacher list:** Explicit names of scholars he received ijazah from or studied under directly.
3. **Photo:** A high-quality portrait.

**If the owner supplies nothing:** Display a minimal, dignified statement:

- Arabic: "هذه الصفحة قيد التحديث. نعمل حالياً على توثيق سيرة الشيخ بدقة ومراجعة المصادر الموثوقة."
- English: "This page is under construction. We are currently verifying the biography with reliable sources."

Do NOT generate filler text like "He was a great scholar..." without specific facts.

---

## (4) Additional improvements / additions, ranked

### 1. Resolve NEEDS-OWNER-REVIEW playlists (Score: 5/5)

- **What:** Categorize the 7 ambiguous playlists (Friday sermons, evening lessons, etc.) into the 6 pillars or create a new "Community Events" pillar.
- **Where:** Library / Where to Start.
- **Why it earns its place:** These contain 700+ videos (a significant portion of content). Leaving them unmapped hurts searchability and discovery. Friday sermons are a distinct genre from regular lessons.
- **Acceptance criteria:** All 71 playlists mapped to a pillar and level. No "Uncategorized" items in search results.

### 2. Data reconciliation script (Score: 4/5)

- **What:** Create a simple Node.js/Python script to compare catalog DATA (JSON) vs YouTube inventory TSV. Generate a diff report.
- **Where:** Build tooling, not the app UI.
- **Why it earns its place:** Discrepancies (4,320 vs 4,332 memberships; Bukhari counts) indicate missing videos or stale data. Users will encounter broken links or missing content.
- **Acceptance criteria:** Report identifies exactly which IDs are in TSV but not in app DATA, and vice versa. Owner reviews and updates JSON.

### 3. Native-Arabic copy audit (Score: 4/5)

- **What:** Hire a native Arabic speaker (or use the owner's network) to review all UI strings, especially labels for pillars, actions, and errors.
- **Where:** All screens.
- **Why it earns its place:** Machine translation or non-native writing often misses the dignified tone required for a scholarly library. Terms like "Worship" vs "Ibadah" need contextual nuance.
- **Acceptance criteria:** Sign-off sheet from reviewer confirming tone and accuracy of key screens (Home, Player, Search, About).

### 4. Performance optimization: virtualized lists (Score: 3/5)

- **What:** Implement virtual scrolling for playlist and search result views.
- **Where:** Playlist and search views.
- **Why it earns its place:** Rendering 4,000 DOM nodes causes lag on low-end devices. Even with pagination, large lists need optimization.
- **Acceptance criteria:** Scroll FPS above 55 on mid-range Android/iOS devices with 500+ visible items.

### 5. Accessibility: focus management and contrast (Score: 3/5)

- **What:** Ensure all interactive elements have visible focus rings. Check color contrast ratios (WCAG AA) for Arabic text on dark/light modes.
- **Where:** All screens.
- **Why it earns its place:** Scholarly audiences may include older users with visual impairments. Keyboard navigation must work fully (Tab/Enter/Escape).
- **Acceptance criteria:** Pass axe-core audit with zero critical violations. Manual keyboard-only test passes.

### 6. Search enhancement: synonym mapping (Score: 2/5)

- **What:** Add basic synonym map for common terms (e.g. "Tawhid" = "Monotheism", "Seerah" = "Biography", "Ramadan" = "Fasting").
- **Where:** Search.
- **Why it earns its place:** Users may search in English or use different Arabic terms. Improves recall.
- **Acceptance criteria:** Search for "Prayer" returns results for "Salah". Search for "Faith" returns "Iman".

---

## (5) Risks: what could go wrong, what to verify before building

1. **Broken YouTube links:** If the original YouTube videos are deleted or made private, the fallback fails.
   - Mitigation: periodic health check script (offline tool) to validate YT IDs against YouTube API (requires internet, run by owner, not end-user). Mark dead links in data.
2. **PDF size bloat:** Adding books could increase the single-file app size significantly, causing slow load times or storage issues on mobile.
   - Mitigation: Compress PDFs aggressively. Consider splitting books into separate downloadable chunks if total size exceeds 500MB.
3. **Unverified biography claims:** Including incorrect teacher names damages credibility.
   - Mitigation: Strict "silent on unknown" policy. Require owner sign-off on every factual claim.
4. **RTL layout breaks:** New components (Books, About) might break existing RTL chrome.
   - Mitigation: Rigorous testing on iOS Safari and Android Chrome with RTL enabled.
5. **Data desync:** Continuing to build features while data discrepancies remain unresolved leads to bugs.
   - Mitigation: Freeze feature development until data reconciliation (item 2 above) is complete.

---

## (6) Anything Qwen would explicitly NOT do, and why

1. **No auto-play videos:** Never auto-play video audio or recitation upon opening a series. Respect user bandwidth and attention.
2. **No social media embeds:** Do not embed Twitter/X feeds or Instagram galleries. They require external requests and violate the offline-first constraint.
3. **No user accounts/login:** Keep it anonymous and local. No email collection, no cloud sync.
4. **No "AI summaries" of books/videos:** Do not generate synthetic descriptions. Use owner-provided text or leave blank.
5. **No changing recitation audio source:** Stick to the bundled CC0 Aaqib Azeez file. Do not swap for other reciters unless explicitly instructed by owner.
6. **No em dash character in UI copy:** As per constraints, use hyphens (-) or colons (:) for punctuation in UI copy.

---

## Voice-agent note (not Qwen's words; flags for the verdict coordinator)

Qwen's answer is usable as written except for four points where it conflicts with grounding the coordinator supplied. These are flagged, not silently fixed, so the verdict can rule on them:

1. **Books as a new top-level nav item conflicts with the v4 nav.** The nav has exactly 5 items (fixed in v4 for the 390px clip), and round 3 sets a maximum of 5 top-level destinations. Qwen's proposed label "المكتبة" also collides with the existing Library nav item. The Books section should live inside the existing structure instead, e.g. as a tab in the About hub or a Library section, keeping the nav at 5.
2. **"Under construction" fallback copy conflicts with the zero-placeholder rule.** The content-mapping report resolves unfinished copy by removal or by finished library-owned wording, never by "awaiting" language. If the owner supplies no biography, the About the Sheikh page should either be omitted from the nav until verified facts exist, or carry finished wording that states only what is known (name, role, and the archive's series index), with no "under construction" line.
3. **"Generic placeholder design" for missing book covers** is the same problem: no placeholder art or placeholder copy ships. A book without a supplied cover gets the existing khatam-emblem treatment (the library's own motif), not a placeholder.
4. **Virtualized lists (item 4) contradict the v4 track-F decision**, which rejected a virtualized windowing library in favor of chunked rendering plus `content-visibility` and a soft cap near 1,500 rendered cards with a quiet "Show more" button. If the verdict wants virtualization, it must explicitly overturn that decision and name the dependency-free implementation, since no new dependency may be added silently.
5. **Two smaller cautions:** the YouTube health-check script in risk 1 needs a YouTube API key and internet, so it can only ever be an owner-run offline tool, never an app feature and never a paid key without the owner's word; and a bundled PDF.js viewer must be weighed against single-file size and its license checked at build time (it is not a free choice by default). Qwen's "Methodology" section in (3) also needs care: the Sheikh's approach must be stated in his own words or omitted, not summarized by the builder.
6. **Transcription note:** Qwen's section (6) item 6 named the forbidden punctuation character literally in its own text; the literal glyph was removed in transcription above. No proposed UI copy in this file contains it. Qwen's Arabic copy strings are as Qwen wrote them; Qwen itself flagged that a native-reader check is still owed (see item 3 in section 4), and the v4 TEST-RESULTS.md lists the native-Arabic copy check as unverified, so that check remains open.
