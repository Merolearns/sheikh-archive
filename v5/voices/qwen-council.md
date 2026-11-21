# QWEN voice - V5 consultation, ROUND 2 (THE COUNCIL)

- Voice: Qwen (Arabic-first reviewer)
- Model: qwen3.8-flash, via `~/workspace/custom-connectors/custom.qwen/bin/qwen-chat`
- Call: 2026-11-20 ~15:10 PST. Tokens: 2,280 in / 2,602 out, finish_reason `stop`. Usage logged to `usage-log.tsv` in the connector directory. No PAUSED file present; spend guardrail ($25 notify / $50 pause) not triggered.
- Method: the full council question (v4 audit facts, the other four voices' round-1 positions, the twelve known tensions, hard constraints) was sent to Qwen in one call. Everything in sections (1) to (5) below is Qwen's answer, transcribed verbatim. The only edits are formatting. The voice-agent note at the end is not Qwen's words.
- Grounding read first by the voice agent: all five answered voice files (`qwen.md`, `codex.md`, `deepseek.md`, `gemini.md`, `kimi.md`) plus `glm.md` (GLM silent, no credential, counts as absent); vetted playbook §3.33 (Roast Room discipline) and §8 DO NOT list; `v4/TEST-RESULTS.md`; `v4/DECISIONS.md`; the live preview file `v4-preview/sheikh-library-v4-preview.html` (verified firsthand in this session: zero YouTube references, `CATALOG_VERSION 3c30b87ae0c1`).

---

## (1) V4 Audit Verdict: Claim by Claim

The v4 "TEST-RESULTS" are technically valid for a *mock environment* but insufficient for *production readiness*. The distinction between "headless Chromium with generated MKVs" and "real media on real hardware" is critical because browser video codecs (H.264/VP9 vs. HEVC/AV1 in modern MKV containers) behave differently across engines.

**Claims that HOLD UP:**
*   **Zero External Requests:** Verified via network interception. This is robust.
*   **Data Integrity (Structural):** The app loads the JSON without crashing. The counts (3,977 videos) match the internal state.
*   **UI Logic:** Navigation, filtering, and search mechanics work as coded.
*   **Constraint Compliance:** No em-dashes, no placeholder text strings ("TBD", etc.) found in source.

**Claims that DO NOT HOLD UP / REQUIRE RE-VERIFICATION:**
*   **"Recitation 20.8s":** Unverified against real audio latency or device volume limits. Needs human ear check.
*   **"26/26 HTTP / Screenshots":** These were likely automated visual diffs. They do not catch subtle layout breaks on different aspect ratios or font rendering differences in Safari/Firefox.
*   **"Real Media Playback":** Completely unverified. Generated MKVs often use uncompressed PCM audio and raw video, bypassing codec errors that occur with H.265/HEVC or complex muxing. If the owner's laptop uses Intel QuickSync or AMD AV1 decoders, behavior will differ from the Linux VM test bed.
*   **"Arabic Copy Quality":** Marked UNVERIFIED. Automated tests cannot detect poor phrasing, gender mismatches, or lack of natural flow.

**Must Re-verify on Owner's Laptop before V5 ships:**
1.  **Codec Compatibility:** Play at least 10 diverse real videos (different resolutions/codecs) on Windows/macOS Chrome, Firefox, and Safari. Check for black screens or audio-only playback.
2.  **Audio Overlap:** Ensure the bundled CC0 recitation does not bleed into video playback unexpectedly.
3.  **Font Rendering:** Verify Arabic fonts (especially diacritics if used) render correctly in all browsers, particularly Safari's fallback stack.
4.  **Visual Inspection of 65 Screenshots:** Human review for alignment issues on high-DPI displays.

---

## (2) Point-by-Point Debate Replies

#### To Codex
*   **On Dual Playback Placement:** I agree with your restriction to **lesson routes only**. Adding external links to cards/search results creates visual noise and risks accidental clicks on mobile. However, your proposal to make YouTube "primary" when local is missing contradicts the "Offline-First" identity. Even if the file is missing, the UI should show the *intended* local experience first, with YouTube as a clear fallback, not a replacement.
*   **On Books Nav:** You suggest keeping nav at 5 by linking Books from Library/About. This is linguistically weak. "المكتبة" (Library) implies physical/digital books, while "الدروس" (Lessons) implies video. Merging them confuses the mental model. Users looking for videos shouldn't have to dig through a Book section, and vice versa.
*   **On PDF Reader:** Native browser reader is risky for styling consistency across devices. Bundled PDF.js is heavier but ensures the same look everywhere. Since we are offline, dependency size matters less than UX consistency.

#### To DeepSeek
*   **On Hardening vs. Features:** I strongly disagree with "Hardening Only." A library app without access to its secondary content (Books) feels incomplete. However, I agree with your stance on **hiding Books until records exist**. This aligns with my "zero-placeholder" rule. We do not ship an empty tab; we ship nothing.
*   **On Virtualization:** You push for virtualized lists (Score 4). I reject this. The v4 track-F decision rejected it for good reason: complexity. With 3,977 items, chunked rendering + `content-visibility` is sufficient. Virtualization breaks keyboard navigation and screen reader focus management in Arabic RTL layouts unless meticulously tuned. Stick to chunked.
*   **On About Page:** You suggest "غير متوفر" (Not available). While technically accurate, it looks like an error message. Better to omit the section entirely if there is no content, preserving the clean aesthetic.

#### To Gemini
*   **On Books Label:** You propose "الكتب". This collides with the existing "المكتبة" conceptually. In Arabic UI, if you have "المكتبة" (Video Library), calling the book section "الكتب" (Books) is acceptable but slightly ambiguous. I prefer a distinct label or clear separation.
*   **On Missing File State:** You suggest dimming local when missing. This is good visual feedback. But making YouTube primary is wrong. Local should remain the "default intent," with YouTube as the "alternative action."
*   **On Audio Guard:** Correct observation that the guard exists. The risk is only when new sources are added. Keep the current logic.

#### To Kimi
*   **On Dual Playback & Icons:** You propose a 44x44 icon-only YouTube link on cards. **Strong Disagreement.** Icon-only external links are terrible for accessibility and clarity. Is it YouTube? A website? A download? It requires hover states which don't exist on touchscreens. Text labels ("مشاهدة على يوتيوب") are mandatory for clarity, even if smaller.
*   **On Books Nav:** You suggest adding "الكتب" as a 6th item. This violates the standing rule (Max 5 items). We must solve the labeling problem within the 5-item constraint or hide Books until ready.
*   **On PDF Viewer:** Full-screen iframe/native viewer is the most pragmatic solution. Avoid bundling heavy PDF.js if native support covers 95% of cases. Use the "Open File" fallback for edge cases.

---

## (3) Revised Ranked V5 List (with Scores 1-5)

| Priority | Item | Score | Reasoning |
| :--- | :--- | :--- | :--- |
| **1** | **Owner-Hardware Verification Matrix** | **5** | Critical path. Cannot ship without confirming real MKV playback on Win/Mac/Linux + Safari/Chrome/Firefox. |
| **2** | **Catalog Reconciliation Script** | **5** | Resolve the 13 TSV-only / 1 app-only discrepancies. Data integrity is foundational. |
| **3** | **Arabic Copy Polish & Zero-Placeholder Enforcement** | **5** | Remove any "under construction" vibes. Ensure all UI strings are final, native-sounding Arabic. |
| **4** | **Dual Playback Logic (Detail Page Only)** | **4** | Implement clearly on lesson details. Local = Primary Button. YouTube = Secondary Link/Button. Do not clutter cards. |
| **5** | **Books Feature (Hidden until Ready)** | **4** | Build the infrastructure/data model for Books, but keep the Nav Item hidden until >1 approved book exists. No empty tabs. |
| **6** | **Accessibility Focus & Contrast Sweep** | **4** | Specifically test RTL focus order and color contrast for disabled states (e.g., missing video). |
| **7** | **Performance Optimization (Chunked Rendering)** | **3** | Verify the 1,500-card soft cap works smoothly on lower-end devices. Do not implement virtualization. |
| **8** | **PDF Viewing Strategy (Native First)** | **3** | Default to browser-native PDF view. Add a simple "Download/Open" button for compatibility. Avoid bundling PDF.js. |
| **9** | **Search Synonym Mapping** | **2** | Nice-to-have. Current keyword search is functional. Low ROI for effort. |
| **10** | **YouTube Health Check Tool** | **1** | Too low priority. Videos rarely break instantly. Handle 404s gracefully at runtime instead. |

---

## (4) Concessions & Changes from Round 1

1.  **Conceded on Dual Playback Placement:** I previously considered putting links on series cards. **Changed mind.** I now agree with Codex/DeepSeek that cards should remain clean. Links belong only on the Lesson Detail page.
2.  **Conceded on Books Nav Visibility:** I initially suggested a 6th nav item. **Changed mind.** I accept the "Hide until data exists" approach proposed by DeepSeek/Kimi. We will not ship a broken or empty nav item.
3.  **Changed Mind on PDF Reader:** I initially pushed for bundled PDF.js. **Changed mind.** Given the offline constraint and simplicity preference, using the **native browser PDF viewer** with a graceful fallback to "Open with System App" is superior. It reduces bundle size and leverages OS-level features.
4.  **Held Ground on Virtualization:** Despite DeepSeek's score of 4/5 for virtualization, I hold at **3/5 for rejection**. Chunked rendering is safer for RTL accessibility and easier to maintain.
5.  **Held Ground on "Primary" Status:** Against Codex/Gemini, I hold that **Local remains Primary** even when missing. The UI must reflect the app's core promise (offline library), not just immediate availability. The missing state shows "File Not Found" locally, with a separate "Try Online" option.

---

## (5) Remaining Open Disagreements for Claude Code

1.  **The Books Nav Label Collision:**
    *   *Problem:* "المكتبة" is taken by Video Library. "الكتب" (Books) is semantically close but might confuse users if both are visible.
    *   *My Recommendation:* If Books become visible, rename the Video Library nav item to **"الدروس"** (Lessons) or **"الفيديوهات"** (Videos)?
        *   *Risk:* Changing the main nav label mid-development is disruptive.
        *   *Alternative:* Keep Video as "المكتبة" and use **"مؤلفات الشيخ"** (Sheikh's Writings) or simply **"كتب"** (lowercase/generic) if the design allows distinct icons. *Claude needs to decide if renaming the main nav is worth the clarity gain.*

2.  **Exact Arabic Copy for Dual Playback States:**
    *   I need Claude to finalize the exact strings. My proposals:
        *   *Button (Local):* **"تشغيل الفيديو"** (Play Video) - Simple, direct. Or **"المشغّل المحلي"** (Local Player).
        *   *Link (YouTube):* **"مشاهدة على يوتيوب"** (Watch on YouTube). *Do not use "افتح في يوتيوب" (Open in YouTube) as it sounds technical.*
        *   *Missing State Header:* **"الملف غير متوفر محلياً"** (File not available locally).
        *   *Fallback Action:* **"جرب المشاهدة عبر الإنترنت"** (Try watching online).

3.  **Handling the "Unknown" About Page Facts:**
    *   *Debate:* Should we list *no* biography if unknown, or a static line?
    *   *My Stance:* **Static Line Only.** "الشيخ مصطفى كامل عالم ديني وداعية إسلامي معاصر." (Sheikh Mustafa Kamel is a contemporary religious scholar and Islamic preacher.) This is safe, true, and fills space without inventing facts. Any specific teacher/ijazah info stays blank/omitted.

4.  **iOS/Safari Specific Behavior:**
    *   Safari on iOS handles `<video>` tags differently (often opening fullscreen immediately). Does this break our custom controls? *Needs verification.* If it does, we may need a specific iOS warning or simplified player.

---

## Voice-agent note (not Qwen's words; flags for the verdict coordinator)

1. **No em dash in Qwen's reply.** Verified by grep on the raw reply (0 matches). No proposed UI copy in this file contains the forbidden character.
2. **Two imprecisions in Qwen's §1, flagged not silently fixed:**
   - Qwen calls the 65 screenshot checks "likely automated visual diffs." Per TEST-RESULTS.md they are automated checks (console errors, horizontal overflow, broken images, `dir`, requests leaving the origin), and a listed subset of screens was reviewed by eye; the rest passed automated checks only. Qwen's underlying point stands: no full human review happened.
   - Qwen lists "Recitation 20.8s" as unverified. The duration itself was verified (browser reports 20.8 s; the file is 799 frames, about 20.9 s). What is unverified is audible behaviour on real hardware, which is Qwen's real point.
3. **Books hidden threshold differs from DeepSeek's.** Qwen's item 5 says hide until ">1 approved book exists"; DeepSeek's round-1 rule hides until at least one approved book record and file exist. The verdict should pick one threshold.
4. **Qwen's proposed About static line is a new characterization, not yet a verified fact.** "الشيخ مصطفى كامل عالم ديني وداعية إسلامي معاصر" (contemporary religious scholar and Islamic preacher) needs owner approval and a publishable source before it can ship as a factual claim; treat it as a wording proposal for Claude Code to adjudicate, not as sourced biography. Note the tension with Qwen's own §2 reply to DeepSeek, where Qwen argues for omitting a section entirely rather than showing a "not available" line: the static line is Qwen's middle path between omission and placeholder, and it still needs the same owner sign-off as any other bio claim.
5. **Qwen's PDF position is internally split and the concession resolves it.** In §2 Qwen tells Codex that bundled PDF.js "ensures the same look everywhere" and tells Kimi that native is "the most pragmatic solution"; §4 then concedes the point and lands on native-first with an Open-file fallback. The verdict should take §4 as Qwen's settled position.
6. **"Local remains primary even when missing" is Qwen's sharpest minority hold.** Codex, DeepSeek (in the missing state) and Kimi (in the 404 state) all promote YouTube to primary when the local file is absent; Qwen alone holds local as the stated default intent with YouTube as a separate fallback action. This is the cleanest adjudication item in the file.
7. **GLM remains silent** (no credential; recorded in `glm.md`). GLM counts as absent, never as agreement, and is not counted toward any majority here.
8. **No playbook §8 DO NOT item was re-vetted or re-bought.** Nothing in Qwen's reply proposes a purchase, a paid key, a third-party cloud, an embed, or an AI-generated asset.
